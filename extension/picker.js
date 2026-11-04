(() => {
  if (globalThis.__taskelioPicking) return;
  globalThis.__taskelioPicking = true;
  const banner = document.createElement('div');
  banner.textContent = 'Taskelio · Clique no elemento desejado. Esc para cancelar.';
  banner.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:2147483647;padding:16px 24px;background:#183f37;color:white;border-radius:12px;font:14px system-ui;pointer-events:none;box-shadow:0 4px 24px #0003;';
  document.documentElement.append(banner);
  let hovered, oldOutline;
  function selector(el) {
    if (el.id && document.querySelectorAll('#' + CSS.escape(el.id)).length === 1) return '#' + CSS.escape(el.id);
    const parts = [];
    while (el && el !== document.documentElement) {
      let part = el.tagName.toLowerCase();
      for (const attr of ['data-testid', 'data-test', 'name']) {
        if (el.getAttribute(attr)) { part += `[${attr}="${CSS.escape(el.getAttribute(attr))}"]`; break; }
      }
      if (!part.includes('[')) {
        const siblings = el.parentElement ? [...el.parentElement.children].filter(s => s.tagName === el.tagName) : [];
        if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(el) + 1})`;
      }
      parts.unshift(part);
      if (document.querySelectorAll(parts.join(' > ')).length === 1) return parts.join(' > ');
      el = el.parentElement;
    }
    return parts.join(' > ');
  }
  function move(event) {
    if (hovered) hovered.style.outline = oldOutline;
    hovered = event.target;
    oldOutline = hovered.style.outline;
    hovered.style.outline = '2px solid #23a884';
  }
  function cleanup() {
    if (hovered) hovered.style.outline = oldOutline;
    banner.remove();
    document.removeEventListener('pointermove', move, true);
    document.removeEventListener('click', pick, true);
    document.removeEventListener('keydown', key, true);
    setTimeout(() => { globalThis.__taskelioPicking = false; }, 0);
  }
  function key(event) { if (event.key === 'Escape') { event.preventDefault(); cleanup(); } }
  function pick(event) {
    event.preventDefault(); event.stopImmediatePropagation();
    const el = event.target;
    const result = selector(el);
    const value = el.type === 'checkbox' ? String(el.checked) : ('value' in el ? el.value : el.textContent?.trim().slice(0, 120));
    cleanup();
    void chrome.runtime.sendMessage({ type: 'PICKED', selector: result, value: value || '' }).catch(error => console.warn('Taskelio:', error.message));
  }
  document.addEventListener('pointermove', move, true);
  document.addEventListener('click', pick, true);
  document.addEventListener('keydown', key, true);
})();
