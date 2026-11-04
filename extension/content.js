(() => {
  if (globalThis.__taskelioObserver) return;
  globalThis.__taskelioObserver = true;
  let rules = [], lastUrl = '', timer, running = false;
  let previous = new Map();
  const normalize = value => String(value ?? '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
  const valueOf = el => el.type === 'checkbox' ? (el.checked ? 'true' : 'false') : ('value' in el ? el.value : el.textContent);
  function matches(rule) {
    const pattern = rule.path.split('*').map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*');
    return rule.enabled && location.origin === rule.origin && new RegExp(`^${pattern}$`).test(location.pathname + location.hash);
  }
  function entity(rule) {
    if (rule.identitySelector) {
      const el = document.querySelector(rule.identitySelector);
      const key = el?.getAttribute('data-id') || el?.getAttribute('href') || (el ? valueOf(el) : '');
      if (!key) return null;
      return String(key).slice(0, 4096);
    }
    // Deliberately omit search params; use an explicit identity selector for query-based records.
    return location.origin + location.pathname + location.hash;
  }
  async function emit(rule) {
    const key = entity(rule);
    if (!key) return;
    try {
      const reply = await chrome.runtime.sendMessage({ type: 'ACTIVITY', ruleId: rule.id, url: location.href, entity: key });
      if (!reply?.ok) console.warn('Taskelio:', reply?.error || 'Não foi possível registrar a atividade.');
    } catch (error) { console.warn('Taskelio:', error.message); }
  }
  async function check() {
    if (running) return;
    running = true;
    try {
      const route = location.origin + location.pathname + location.hash;
      const changedPage = route !== lastUrl;
      if (changedPage) { lastUrl = route; previous.clear(); }
      for (const rule of rules) {
        if (!matches(rule)) { previous.delete(rule.id); continue; }
        if (rule.trigger === 'visit') { if (changedPage) await emit(rule); continue; }
        if (rule.trigger !== 'field') continue;
        try {
          const el = document.querySelector(rule.selector);
          const currentEntity = entity(rule);
          if (!el) continue;
          const matched = normalize(valueOf(el)) === normalize(rule.value);
          const old = previous.get(rule.id);
          // An already-completed item on first load is a baseline, not new work.
          if (old && old.entity === currentEntity && !old.matched && matched) await emit(rule);
          previous.set(rule.id, { entity: currentEntity, matched });
        } catch { /* A stale selector must not stop the other rules. */ }
      }
    } finally { running = false; }
  }
  async function load() {
    try {
      const reply = await chrome.runtime.sendMessage({ type: 'GET_RULES' });
      if (reply?.ok) { rules = reply.data; previous.clear(); await check(); }
    } catch { /* Extension may have been reloaded. */ }
  }
  new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(check, 150); }).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true });
  document.addEventListener('click', event => {
    if (globalThis.__taskelioPicking || !event.isTrusted) return;
    for (const rule of rules) {
      if (rule.trigger !== 'click' || !matches(rule)) continue;
      try { if (event.target instanceof Element && event.target.closest(rule.selector)) void emit(rule); } catch { /* Invalid selector. */ }
    }
  }, true);
  document.addEventListener('change', () => void check(), true);
  document.addEventListener('input', () => void check(), true);
  // Polling also catches SPA routing and programmatic input.value updates.
  setInterval(check, 1000);
  chrome.runtime.onMessage.addListener(message => { if (message.type === 'RELOAD_RULES') void load(); });
  void load();
})();
