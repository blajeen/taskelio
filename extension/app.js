import { stats, csv } from './core.js';
import { t, language, initLanguage, setLanguage, applyTranslations, errorMessage } from './i18n.js';
const $ = selector => document.querySelector(selector);
let state, editing = null, view = 'overview', toastTimer;
const form = $('#rule-form');
const field = name => form.elements.namedItem(name);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
async function api(type, rest = {}) {
  const reply = await chrome.runtime.sendMessage({ type, ...rest });
  if (!reply?.ok) throw new Error(reply?.error || 'ERR_ACTION');
  return reply.data;
}
function toast(text) { clearTimeout(toastTimer); $('#toast').textContent = text; $('#toast').hidden = false; toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4500); }
function showError(error) { toast(errorMessage(error)); }
function card(rule) {
  const s = stats(state, rule.id);
  const percent = rule.goal ? Math.min(100, Math.round(s.today / rule.goal * 100)) : 0;
  const trigger = t(rule.trigger);
  return `<article class="counter-card"><div class="card-heading"><div><h3>${escape(rule.name)}</h3><div class="site">${escape(new URL(rule.origin).host)} · ${trigger}</div></div><span class="badge ${rule.enabled ? '' : 'paused'}">${t(rule.enabled ? 'active' : 'paused')}</span></div><div class="counter-number">${s.today}<span>${t('today')}</span></div>${rule.goal ? `<div class="progress"><span style="width:${percent}%"></span></div><div class="goal-label"><span>${t('goalLabel', { goal: rule.goal })}</span><span>${percent}%</span></div>` : `<div class="goal-label"><span>${t('totalLabel', { total: s.total })}</span><span>${t('noGoal')}</span></div>`}<div class="card-bottom"><button class="text-button" data-action="manual" data-id="${rule.id}">${t('add')}</button><button class="text-button" data-action="edit" data-id="${rule.id}">${t('edit')}</button><button class="text-button" data-action="toggle" data-id="${rule.id}">${t(rule.enabled ? 'pause' : 'resume')}</button><button class="text-button danger" data-action="delete" data-id="${rule.id}">${t('delete')}</button></div></article>`;
}
function render() {
  const s = stats(state);
  $('#metric-today').textContent = s.today;
  $('#metric-total').textContent = s.total;
  $('#metric-average').textContent = s.average.toLocaleString(language, { maximumFractionDigits: 1 });
  $('#rule-count').textContent = state.rules.length;
  const empty = `<div class="empty-state"><div class="empty-symbol">✓</div><h3>${t('emptyHeading')}</h3><p>${t('emptyDescription')}</p><button class="primary" data-action="new">${t('emptyCreate')}</button></div>`;
  const cards = state.rules.length ? state.rules.map(card).join('') : empty;
  $('#counter-list').innerHTML = cards;
  $('#rules-list').innerHTML = cards;
  $('#history-body').innerHTML = state.events.length ? state.events.slice(-100).reverse().map(e => `<tr class="${e.undone ? 'undone' : ''}"><td>${escape(e.ruleName)}</td><td>${escape(new Date(e.at).toLocaleString(language))}</td><td>${t(e.source === 'manual' ? 'manual' : 'automatic')}</td><td>${e.undone ? t('undone') : `<button class="text-button" data-action="undo" data-id="${e.id}">${t('undo')}</button>`}</td></tr>`).join('') : `<tr><td colspan="4" class="muted">${t('historyEmpty')}</td></tr>`;
}
async function refresh() { state = await api('GET_STATE'); render(); }
function changeView(next) {
  view = next;
  const labels = { overview: ['overview', 'overviewTitle', 'overviewDescription'], rules: ['rules', 'rulesTitle', 'rulesDescription'], history: ['history', 'historyTitle', 'historyDescription'] };
  $('#breadcrumb').textContent = t(labels[view][0]); $('#page-title').textContent = t(labels[view][1]); $('#page-description').textContent = t(labels[view][2]);
  for (const name of Object.keys(labels)) $(`#${name}-view`).hidden = name !== view;
  document.querySelectorAll('[data-view]').forEach(el => el.classList.toggle('selected', el.dataset.view === view));
}
function triggerFields() {
  const trigger = field('trigger').value;
  $('#element-fields').hidden = trigger === 'visit';
  $('#value-field').hidden = trigger !== 'field';
  field('selector').required = trigger !== 'visit'; field('value').required = trigger === 'field';
  $('#trigger-note').textContent = t({ field: 'noteField', visit: 'noteVisit', click: 'noteClick' }[trigger]);
}
function openForm(rule) {
  editing = rule || null; form.reset();
  if (rule) for (const [key, value] of Object.entries(rule)) if (field(key)) field(key).value = value;
  $('#dialog-title').textContent = t(rule ? 'dialogEdit' : 'dialogNew');
  $('#form-feedback').textContent = ''; triggerFields(); $('#rule-dialog').showModal();
}
async function matchingTab(origin) {
  const tabs = await chrome.tabs.query({ url: origin + '/*' });
  const candidates = tabs.filter(t => t.id);
  const tab = candidates.find(t => t.active) || candidates.sort((a,b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))[0];
  if (!tab) throw new Error('ERR_TAB');
  return tab;
}
async function grant(origin) {
  if (!await chrome.permissions.request({ origins: [origin + '/*'] })) throw new Error('ERR_GRANT');
}
function selectorsValid() {
  for (const name of ['selector', 'identitySelector']) if (field(name).value) {
    try { document.createDocumentFragment().querySelector(field(name).value); } catch { throw new Error('ERR_SELECTOR'); }
  }
}
form.addEventListener('submit', async event => {
  event.preventDefault(); $('#form-feedback').textContent = '';
  try {
    selectorsValid();
    const origin = new URL(field('origin').value).origin;
    await grant(origin);
    const rule = { ...editing, ...Object.fromEntries(new FormData(form)) };
    $('#save-rule').disabled = true;
    await api('SAVE_RULE', { rule });
    $('#rule-dialog').close(); await refresh(); toast(t('saved'));
  } catch (error) { $('#form-feedback').textContent = errorMessage(error); }
  finally { $('#save-rule').disabled = false; }
});
$('#pick-element').addEventListener('click', async () => {
  try {
    const origin = new URL(field('origin').value).origin; await grant(origin);
    await chrome.storage.session.remove('picked');
    const tab = await matchingTab(origin);
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: value => { globalThis.__taskelioPickerLanguage = value; }, args: [language] });
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['picker.js'] });
    await chrome.tabs.update(tab.id, { active: true }); await chrome.windows.update(tab.windowId, { focused: true });
    $('#form-feedback').textContent = t('pickInstruction');
  } catch (error) { $('#form-feedback').textContent = errorMessage(error); }
});
$('#test-rule').addEventListener('click', async () => {
  try {
    selectorsValid(); const origin = new URL(field('origin').value).origin; await grant(origin); const tab = await matchingTab(origin);
    const [result] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: selector => {
      const elements = document.querySelectorAll(selector);
      const el = elements[0];
      return { count: elements.length, value: el ? (el.type === 'checkbox' ? String(el.checked) : 'value' in el ? String(el.value) : el.textContent.trim()).slice(0, 120) : '' };
    }, args: [field('selector').value] });
    $('#form-feedback').textContent = t('testCount', { count: result.result.count }) + (result.result.count ? t('currentValue', { value: result.result.value }) : t('adjustSelector')) + t('testNoCount');
  } catch (error) { $('#form-feedback').textContent = errorMessage(error); }
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.language) void initLanguage().then(updateLanguage).catch(showError);
  if (area === 'local' && changes.state) { state = changes.state.newValue; render(); }
  if (area === 'session' && changes.picked?.newValue && $('#rule-dialog').open) {
    field('selector').value = changes.picked.newValue.selector;
    $('#form-feedback').textContent = t('picked', { value: changes.picked.newValue.value });
  }
});
document.addEventListener('click', async event => {
  const button = event.target.closest('[data-action]'); if (!button) return;
  const { action, id } = button.dataset; const rule = state.rules.find(r => r.id === id);
  try {
    if (action === 'new') return openForm();
    if (action === 'edit') return openForm(rule);
    if (action === 'manual') { await api('MANUAL', { id }); toast(t('added')); }
    if (action === 'undo') { await api('UNDO', { id }); toast(t('undoToast')); }
    if (action === 'toggle') await api('SAVE_RULE', { rule: { ...rule, enabled: !rule.enabled } });
    if (action === 'delete' && confirm(t('deleteConfirm'))) await api('DELETE_RULE', { id });
    await refresh();
  } catch (error) { showError(error); }
});
$('#export').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([csv(state.events, language)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = `taskelio-${new Date().toISOString().slice(0,10)}.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$('#new-rule').onclick = () => openForm(); $('#learn-create').onclick = () => openForm();
$('#close-dialog').onclick = $('#cancel-dialog').onclick = () => $('#rule-dialog').close();
field('trigger').onchange = triggerFields;
document.querySelectorAll('[data-view]').forEach(el => el.onclick = () => changeView(el.dataset.view));
function updateLanguage() {
  applyTranslations(); changeView(view); triggerFields();
  $('#dialog-title').textContent = t(editing ? 'dialogEdit' : 'dialogNew');
  $('#date-label').textContent = new Date().toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'long' });
  if (state) render();
}
$('#language').onchange = () => setLanguage($('#language').value).then(updateLanguage).catch(showError);
await initLanguage(); updateLanguage();
setInterval(() => { if (state) render(); }, 60000);
refresh().catch(showError);
