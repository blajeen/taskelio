export const EMPTY_STATE = { version: 1, rules: [], events: [] };

export function dayKey(time = Date.now()) {
  const d = new Date(time);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function validateRule(input) {
  const rule = {
    id: input.id || crypto.randomUUID(),
    name: String(input.name || '').trim().slice(0, 80),
    origin: new URL(input.origin).origin,
    path: String(input.path || '*').trim(),
    trigger: input.trigger,
    selector: String(input.selector || '').trim(),
    value: String(input.value || '').trim(),
    identitySelector: String(input.identitySelector || '').trim(),
    dedup: input.dedup || 'daily',
    goal: Number(input.goal || 0),
    enabled: input.enabled !== false,
    createdAt: input.createdAt || Date.now()
  };
  if (!/^https?:\/\//.test(rule.origin)) throw new Error('ERR_ORIGIN');
  if (!rule.name) throw new Error('ERR_NAME');
  if (!['visit', 'click', 'field'].includes(rule.trigger)) throw new Error('ERR_TRIGGER');
  if (!['always', 'daily', 'once'].includes(rule.dedup)) throw new Error('ERR_DEDUP');
  if (rule.trigger !== 'visit' && !rule.selector) throw new Error('ERR_ELEMENT');
  if (rule.trigger === 'field' && !rule.value) throw new Error('ERR_VALUE');
  if (!Number.isInteger(rule.goal) || rule.goal < 0 || rule.goal > 1000000) throw new Error('ERR_GOAL');
  if (!rule.path.startsWith('/') && rule.path !== '*') throw new Error('ERR_PATH');
  return rule;
}

// Match only the path and hash. Query strings often contain private data.
export function matchesRule(rule, rawUrl) {
  try {
    const url = new URL(rawUrl);
    const pattern = rule.path.split('*').map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*');
    return rule.enabled && url.origin === rule.origin && new RegExp(`^${pattern}$`).test(url.pathname + url.hash);
  } catch { return false; }
}

export function recordEvent(state, rule, activity, now = Date.now()) {
  if (!rule.enabled) return { state, counted: false, reason: 'paused' };
  if (!activity.entityKey) throw new Error('ERR_IDENTITY');
  const day = dayKey(now);
  const previous = state.events.filter(e => e.ruleId === rule.id && !e.undone && e.source !== 'manual');
  const duplicate = previous.some(e => e.entityKey === activity.entityKey && (
    rule.dedup === 'once' || (rule.dedup === 'daily' && e.day === day) ||
    (now - e.at >= 0 && now - e.at < 1200)
  ));
  if (duplicate) return { state, counted: false, reason: 'duplicate' };
  const event = {
    id: crypto.randomUUID(), ruleId: rule.id, ruleName: rule.name,
    at: now, day, entityKey: activity.entityKey, source: 'browser', undone: false
  };
  return { state: { ...state, events: [...state.events, event] }, counted: true, event };
}

export function stats(state, ruleId, today = dayKey()) {
  const events = state.events.filter(e => !e.undone && (!ruleId || e.ruleId === ruleId));
  const days = new Set(events.map(e => e.day));
  return {
    today: events.filter(e => e.day === today).length,
    total: events.length,
    activeDays: days.size,
    average: days.size ? events.length / days.size : 0
  };
}

export function csv(events, language = 'pt-BR') {
  const english = language === 'en';
  const quote = value => {
    let text = String(value ?? '');
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  return '\uFEFF' + [
    english ? ['id', 'counter', 'utc_time', 'local_day', 'source', 'undone'] : ['id', 'contador', 'horario_utc', 'dia_local', 'origem', 'desfeito'],
    ...events.map(e => [e.id, e.ruleName, new Date(e.at).toISOString(), e.day, e.source, e.undone ? (english ? 'yes' : 'sim') : (english ? 'no' : 'nao')])
  ].map(row => row.map(quote).join(',')).join('\r\n');
}
