import { stats } from './core.js';
const total = document.querySelector('#total'), counters = document.querySelector('#counters');
async function refresh() {
  try {
    const reply = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
    if (!reply?.ok) throw new Error(reply?.error || 'Não foi possível ler os contadores.');
    total.textContent = stats(reply.data).today; counters.replaceChildren();
    for (const rule of reply.data.rules) {
      const row = document.createElement('div'); row.className = 'row';
      const name = document.createElement('span'); name.textContent = rule.name + (rule.enabled ? '' : ' · pausado');
      const count = document.createElement('strong'); count.textContent = stats(reply.data, rule.id).today;
      row.append(name, count); counters.append(row);
    }
    if (!reply.data.rules.length) { const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = 'Seu primeiro contador começa no painel. Escolha o que conta como trabalho feito para você.'; counters.append(empty); }
  } catch (error) { document.querySelector('#error').textContent = error.message; }
}
document.querySelector('#open').onclick = () => chrome.runtime.openOptionsPage();
chrome.storage.onChanged.addListener(() => void refresh());
void refresh();
