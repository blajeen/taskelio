import { stats } from './core.js';
import { t, initLanguage, setLanguage, applyTranslations, errorMessage } from './i18n.js';
const total = document.querySelector('#total'), counters = document.querySelector('#counters');
async function refresh() {
  try {
    await initLanguage(); applyTranslations();
    const reply = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
    if (!reply?.ok) throw new Error(reply?.error || 'ERR_ACTION');
    total.textContent = stats(reply.data).today; counters.replaceChildren();
    for (const rule of reply.data.rules) {
      const row = document.createElement('div'); row.className = 'row';
      const name = document.createElement('span'); name.textContent = rule.name + (rule.enabled ? '' : ' · ' + t('paused'));
      const count = document.createElement('strong'); count.textContent = stats(reply.data, rule.id).today;
      row.append(name, count); counters.append(row);
    }
    if (!reply.data.rules.length) { const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = t('popupEmpty'); counters.append(empty); }
  } catch (error) { document.querySelector('#error').textContent = errorMessage(error); }
}
document.querySelector('#open').onclick = () => chrome.runtime.openOptionsPage();
document.querySelector('#language').onchange = () => setLanguage(document.querySelector('#language').value).then(refresh).catch(error => { document.querySelector('#error').textContent = errorMessage(error); });
chrome.storage.onChanged.addListener(() => void refresh());
void refresh();
