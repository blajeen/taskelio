import { stats, csv } from './core.js';
const $ = selector => document.querySelector(selector);
let state, editing = null, view = 'overview', toastTimer;
const form = $('#rule-form');
const field = name => form.elements.namedItem(name);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
async function api(type, rest = {}) {
  const reply = await chrome.runtime.sendMessage({ type, ...rest });
  if (!reply?.ok) throw new Error(reply?.error || 'Não foi possível completar a ação.');
  return reply.data;
}
function toast(text) { clearTimeout(toastTimer); $('#toast').textContent = text; $('#toast').hidden = false; toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4500); }
function showError(error) { toast(error.message); }
function card(rule) {
  const s = stats(state, rule.id);
  const percent = rule.goal ? Math.min(100, Math.round(s.today / rule.goal * 100)) : 0;
  const trigger = { visit: 'Página aberta', click: 'Clique em elemento', field: 'Mudança de campo' }[rule.trigger];
  return `<article class="counter-card"><div class="card-heading"><div><h3>${escape(rule.name)}</h3><div class="site">${escape(new URL(rule.origin).host)} · ${trigger}</div></div><span class="badge ${rule.enabled ? '' : 'paused'}">${rule.enabled ? 'Ativo' : 'Pausado'}</span></div><div class="counter-number">${s.today}<span>hoje</span></div>${rule.goal ? `<div class="progress"><span style="width:${percent}%"></span></div><div class="goal-label"><span>Meta: ${rule.goal} por dia</span><span>${percent}%</span></div>` : `<div class="goal-label"><span>${s.total} no total</span><span>Sem meta diária</span></div>`}<div class="card-bottom"><button class="text-button" data-action="manual" data-id="${rule.id}">＋ Adicionar 1</button><button class="text-button" data-action="edit" data-id="${rule.id}">Editar</button><button class="text-button" data-action="toggle" data-id="${rule.id}">${rule.enabled ? 'Pausar' : 'Retomar'}</button><button class="text-button danger" data-action="delete" data-id="${rule.id}">Excluir</button></div></article>`;
}
function render() {
  const s = stats(state);
  $('#metric-today').textContent = s.today;
  $('#metric-total').textContent = s.total;
  $('#metric-average').textContent = s.average.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  $('#rule-count').textContent = state.rules.length;
  const empty = '<div class="empty-state"><div class="empty-symbol">✓</div><h3>O primeiro passo é seu.</h3><p>Crie um contador para algo que você faz todos os dias.<br>O Taskelio acompanha as próximas tarefas por você.</p><button class="primary" data-action="new">＋ Criar meu primeiro contador</button></div>';
  const cards = state.rules.length ? state.rules.map(card).join('') : empty;
  $('#counter-list').innerHTML = cards;
  $('#rules-list').innerHTML = cards;
  $('#history-body').innerHTML = state.events.length ? state.events.slice(-100).reverse().map(e => `<tr class="${e.undone ? 'undone' : ''}"><td>${escape(e.ruleName)}</td><td>${escape(new Date(e.at).toLocaleString('pt-BR'))}</td><td>${e.source === 'manual' ? 'Manual' : 'Automático'}</td><td>${e.undone ? 'Desfeito' : `<button class="text-button" data-action="undo" data-id="${e.id}">Desfazer</button>`}</td></tr>`).join('') : '<tr><td colspan="4" class="muted">Seu histórico começa com a primeira tarefa registrada.</td></tr>';
}
async function refresh() { state = await api('GET_STATE'); render(); }
function changeView(next) {
  view = next;
  const labels = { overview: ['Visão geral', 'Cada tarefa conta.', 'Cuide do trabalho. A gente cuida da contagem.'], rules: ['Meus contadores', 'Seu trabalho, suas regras.', 'Configure os sinais que representam uma tarefa feita.'], history: ['Histórico', 'Um registro de cada passo.', 'Acompanhe o que foi contado e ajuste quando precisar.'] };
  $('#breadcrumb').textContent = labels[view][0]; $('#page-title').textContent = labels[view][1]; $('#page-description').textContent = labels[view][2];
  for (const name of Object.keys(labels)) $(`#${name}-view`).hidden = name !== view;
  document.querySelectorAll('[data-view]').forEach(el => el.classList.toggle('selected', el.dataset.view === view));
}
function triggerFields() {
  const trigger = field('trigger').value;
  $('#element-fields').hidden = trigger === 'visit';
  $('#value-field').hidden = trigger !== 'field';
  field('selector').required = trigger !== 'visit'; field('value').required = trigger === 'field';
  $('#trigger-note').textContent = { field: 'Conta quando o valor observado muda para o esperado. Um campo já preenchido ao abrir a página não conta como trabalho novo. A comparação ignora maiúsculas e espaços extras.', visit: 'Conta ao abrir uma página ou navegar para outro endereço dentro do site. Use um caminho específico para evitar contar páginas que não são perfis.', click: 'Conta a intenção do clique. Para contar apenas tarefas concluídas, prefira observar uma mudança de campo ou uma mensagem de confirmação.' }[trigger];
}
function openForm(rule) {
  editing = rule || null; form.reset();
  if (rule) for (const [key, value] of Object.entries(rule)) if (field(key)) field(key).value = value;
  $('#dialog-title').textContent = rule ? 'Editar contador' : 'Novo contador';
  $('#form-feedback').textContent = ''; triggerFields(); $('#rule-dialog').showModal();
}
async function matchingTab(origin) {
  const tabs = await chrome.tabs.query({ url: origin + '/*' });
  const candidates = tabs.filter(t => t.id);
  const tab = candidates.find(t => t.active) || candidates.sort((a,b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))[0];
  if (!tab) throw new Error('Abra uma página desse site em outra aba primeiro.');
  return tab;
}
async function grant(origin) {
  if (!await chrome.permissions.request({ origins: [origin + '/*'] })) throw new Error('O site precisa ser autorizado para a regra funcionar.');
}
function selectorsValid() {
  for (const name of ['selector', 'identitySelector']) if (field(name).value) {
    try { document.createDocumentFragment().querySelector(field(name).value); } catch { throw new Error('O seletor CSS informado é inválido.'); }
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
    $('#rule-dialog').close(); await refresh(); toast('Contador salvo. As próximas atividades já podem contar.');
  } catch (error) { $('#form-feedback').textContent = error.message; }
  finally { $('#save-rule').disabled = false; }
});
$('#pick-element').addEventListener('click', async () => {
  try {
    const origin = new URL(field('origin').value).origin; await grant(origin);
    await chrome.storage.session.remove('picked');
    const tab = await matchingTab(origin);
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['picker.js'] });
    await chrome.tabs.update(tab.id, { active: true }); await chrome.windows.update(tab.windowId, { focused: true });
    $('#form-feedback').textContent = 'Clique no elemento na aba do site e depois volte a este painel.';
  } catch (error) { $('#form-feedback').textContent = error.message; }
});
$('#test-rule').addEventListener('click', async () => {
  try {
    selectorsValid(); const origin = new URL(field('origin').value).origin; await grant(origin); const tab = await matchingTab(origin);
    const [result] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: selector => {
      const elements = document.querySelectorAll(selector);
      const el = elements[0];
      return { count: elements.length, value: el ? (el.type === 'checkbox' ? String(el.checked) : 'value' in el ? String(el.value) : el.textContent.trim()).slice(0, 120) : '' };
    }, args: [field('selector').value] });
    $('#form-feedback').textContent = `${result.result.count} elemento(s) encontrado(s).${result.result.count ? ` Valor atual: “${result.result.value}”.` : ' Ajuste o seletor ou abra a página correta.'} Este teste não adiciona contagens.`;
  } catch (error) { $('#form-feedback').textContent = error.message; }
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.state) { state = changes.state.newValue; render(); }
  if (area === 'session' && changes.picked?.newValue && $('#rule-dialog').open) {
    field('selector').value = changes.picked.newValue.selector;
    $('#form-feedback').textContent = `Elemento selecionado. Valor atual: “${changes.picked.newValue.value}”. Ajuste o valor esperado e teste antes de salvar.`;
  }
});
document.addEventListener('click', async event => {
  const button = event.target.closest('[data-action]'); if (!button) return;
  const { action, id } = button.dataset; const rule = state.rules.find(r => r.id === id);
  try {
    if (action === 'new') return openForm();
    if (action === 'edit') return openForm(rule);
    if (action === 'manual') { await api('MANUAL', { id }); toast('1 tarefa adicionada. Você pode desfazer no histórico.'); }
    if (action === 'undo') { await api('UNDO', { id }); toast('Contagem desfeita.'); }
    if (action === 'toggle') await api('SAVE_RULE', { rule: { ...rule, enabled: !rule.enabled } });
    if (action === 'delete' && confirm('Excluir este contador? Os registros anteriores continuarão no histórico.')) await api('DELETE_RULE', { id });
    await refresh();
  } catch (error) { showError(error); }
});
$('#export').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([csv(state.events)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = `taskelio-${new Date().toISOString().slice(0,10)}.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$('#new-rule').onclick = () => openForm(); $('#learn-create').onclick = () => openForm();
$('#close-dialog').onclick = $('#cancel-dialog').onclick = () => $('#rule-dialog').close();
field('trigger').onchange = triggerFields;
document.querySelectorAll('[data-view]').forEach(el => el.onclick = () => changeView(el.dataset.view));
$('#date-label').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
setInterval(() => { if (state) render(); }, 60000);
refresh().catch(showError);
