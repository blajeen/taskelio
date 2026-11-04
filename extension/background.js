import { EMPTY_STATE, validateRule, matchesRule, recordEvent, dayKey } from './core.js';

let queue = Promise.resolve();
const serial = task => {
  const next = queue.then(task);
  queue = next.catch(() => {});
  return next;
};
const read = async () => (await chrome.storage.local.get('state')).state || structuredClone(EMPTY_STATE);
const write = state => chrome.storage.local.set({ state });

async function syncScripts(state) {
  const origins = [...new Set(state.rules.filter(r => r.enabled).map(r => r.origin))];
  const allowed = [];
  for (const origin of origins) {
    if (await chrome.permissions.contains({ origins: [origin + '/*'] })) allowed.push(origin + '/*');
  }
  const existing = await chrome.scripting.getRegisteredContentScripts();
  if (existing.length) await chrome.scripting.unregisterContentScripts({ ids: existing.map(s => s.id) });
  if (allowed.length) await chrome.scripting.registerContentScripts([{
    id: 'taskelio-observer', matches: allowed, js: ['content.js'], runAt: 'document_idle', persistAcrossSessions: true
  }]);
  const targets = [...new Set([...allowed, ...existing.flatMap(s => s.matches || [])])];
  if (!targets.length) return;
  const tabs = await chrome.tabs.query({ url: targets });
  await Promise.allSettled(tabs.filter(t => t.id).map(async t => {
    if (allowed.some(pattern => t.url?.startsWith(pattern.slice(0, -1)))) {
      await chrome.scripting.executeScript({ target: { tabId: t.id }, files: ['content.js'] });
    }
    await chrome.tabs.sendMessage(t.id, { type: 'RELOAD_RULES' });
  }));
}

async function hash(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}

async function handle(message, sender) {
  const fromPage = !sender.url?.startsWith(chrome.runtime.getURL(''));
  if (message.type === 'PICKED') {
    if (!fromPage || !sender.tab || sender.frameId !== 0) throw new Error('ERR_SELECTION');
    const origin = new URL(sender.url).origin;
    if (!await chrome.permissions.contains({ origins: [origin + '/*'] })) throw new Error('ERR_UNAUTHORIZED');
    if (typeof message.selector !== 'string' || message.selector.length > 4096) throw new Error('ERR_SELECTOR');
    await chrome.storage.session.set({ picked: { selector: message.selector, value: String(message.value || '').slice(0, 120), at: Date.now() } });
    return true;
  }
  if (message.type === 'GET_RULES') {
    const state = await read();
    if (!fromPage) return state.rules;
    const origin = new URL(sender.url).origin;
    return state.rules.filter(r => r.enabled && r.origin === origin);
  }
  if (message.type === 'ACTIVITY') {
    if (!fromPage || sender.frameId !== 0) throw new Error('ERR_SOURCE');
    const state = await read();
    const rule = state.rules.find(r => r.id === message.ruleId);
    if (!rule || !matchesRule(rule, message.url) || new URL(sender.url).origin !== rule.origin) return { counted: false };
    if (!(await chrome.permissions.contains({ origins: [rule.origin + '/*'] }))) return { counted: false };
    if (typeof message.entity !== 'string' || message.entity.length > 4096) throw new Error('ERR_IDENTIFIER');
    const entityKey = await hash(rule.origin + '|' + message.entity);
    const result = recordEvent(state, rule, { entityKey });
    if (result.counted) await write(result.state);
    return { counted: result.counted, reason: result.reason };
  }
  // Content scripts cannot edit rules, read history or change counters.
  if (fromPage) throw new Error('ERR_PANEL');
  const state = await read();
  if (message.type === 'GET_STATE') return state;
  if (message.type === 'SAVE_RULE') {
    const rule = validateRule(message.rule);
    if (!(await chrome.permissions.contains({ origins: [rule.origin + '/*'] }))) throw new Error('ERR_PERMISSION');
    const index = state.rules.findIndex(r => r.id === rule.id);
    if (index < 0) state.rules.push(rule); else state.rules[index] = rule;
    await write(state);
    await syncScripts(state);
    return rule;
  }
  if (message.type === 'DELETE_RULE') {
    state.rules = state.rules.filter(r => r.id !== message.id);
    await write(state);
    await syncScripts(state);
    return true;
  }
  if (message.type === 'MANUAL') {
    const rule = state.rules.find(r => r.id === message.id);
    if (!rule) throw new Error('ERR_COUNTER');
    const now = Date.now();
    state.events.push({ id: crypto.randomUUID(), ruleId: rule.id, ruleName: rule.name, at: now, day: dayKey(now), source: 'manual', entityKey: '', undone: false });
    await write(state);
    return true;
  }
  if (message.type === 'UNDO') {
    const event = state.events.find(e => e.id === message.id);
    if (event) { event.undone = true; await write(state); }
    return true;
  }
  throw new Error('ERR_UNKNOWN');
}

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  serial(() => handle(message, sender)).then(data => respond({ ok: true, data }), error => respond({ ok: false, error: error.message }));
  return true;
});
chrome.runtime.onInstalled.addListener(() => serial(async () => {
  await chrome.storage.local.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' });
  await write(await read());
  await syncScripts(await read());
}));
chrome.runtime.onStartup.addListener(() => serial(async () => syncScripts(await read())));
chrome.permissions.onRemoved.addListener(() => serial(async () => syncScripts(await read())));
