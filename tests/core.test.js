import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRule, matchesRule, recordEvent, stats, csv, dayKey } from '../extension/core.js';
const makeRule = changes => validateRule({ name: 'Qualified', origin: 'https://crm.example.com', path: '/person/*', trigger: 'field', selector: '#qualified', value: 'Yes', ...changes });
const empty = () => ({ version: 1, rules: [], events: [] });
const now = new Date(2026, 10, 4, 12).getTime();

test('validates origins, names, triggers, paths and integer goals', () => {
  assert.equal(makeRule({ origin: 'https://crm.example.com/path' }).origin, 'https://crm.example.com');
  for (const changes of [{ name: '' }, { origin: 'file:///tmp' }, { trigger: 'network' }, { selector: '' }, { value: '' }, { goal: -1 }, { goal: 1.5 }, { dedup: 'unknown' }, { path: 'person/*' }]) assert.throws(() => makeRule(changes));
});
test('matches the exact origin and escaped path with wildcards; omits query strings', () => {
  const rule = makeRule();
  assert.ok(matchesRule(rule, 'https://crm.example.com/person/1?tracking=secret'));
  assert.ok(!matchesRule(rule, 'https://evil.example.com/person/1'));
  assert.ok(!matchesRule(rule, 'https://crm.example.com/personnel/1'));
  assert.ok(!matchesRule({ ...rule, enabled: false }, 'https://crm.example.com/person/1'));
  assert.ok(matchesRule(makeRule({ path: '/app#/person/*' }), 'https://crm.example.com/app#/person/123'));
  assert.ok(!matchesRule(makeRule({ path: '/person/a.b' }), 'https://crm.example.com/person/axb'));
});
test('deduplicates each item daily and counts it again the next local day', () => {
  const rule = makeRule();
  const a = recordEvent(empty(), rule, { entityKey: 'person1' }, now);
  assert.ok(a.counted);
  assert.ok(!recordEvent(a.state, rule, { entityKey: 'person1' }, now + 5000).counted);
  assert.ok(recordEvent(a.state, rule, { entityKey: 'person2' }, now + 5000).counted);
  assert.ok(recordEvent(a.state, rule, { entityKey: 'person1' }, now + 86400000).counted);
});
test('once remains unique across days; always still suppresses rapid duplicate delivery', () => {
  const rule = makeRule({ dedup: 'once' });
  const a = recordEvent(empty(), rule, { entityKey: '1' }, now);
  assert.ok(!recordEvent(a.state, rule, { entityKey: '1' }, now + 86400000).counted);
  const every = { ...rule, dedup: 'always' };
  assert.ok(!recordEvent(a.state, every, { entityKey: '1' }, now + 500).counted);
  assert.ok(recordEvent(a.state, every, { entityKey: '1' }, now + 1500).counted);
});
test('undo permits a replacement count; paused rules never count', () => {
  const rule = makeRule();
  const a = recordEvent(empty(), rule, { entityKey: '1' }, now);
  a.state.events[0].undone = true;
  assert.ok(recordEvent(a.state, rule, { entityKey: '1' }, now + 5000).counted);
  assert.ok(!recordEvent(empty(), { ...rule, enabled: false }, { entityKey: '1' }, now).counted);
});
test('stats use local calendar days, include manual entries and exclude undone events', () => {
  const state = { ...empty(), events: [
    { ruleId: 'a', at: now, day: dayKey(now), source: 'browser' },
    { ruleId: 'a', at: now, day: dayKey(now), source: 'manual' },
    { ruleId: 'a', at: now, day: dayKey(now), undone: true },
    { ruleId: 'b', at: now - 86400000, day: dayKey(now - 86400000) }
  ] };
  assert.deepEqual(stats(state, undefined, dayKey(now)), { today: 2, total: 3, activeDays: 2, average: 1.5 });
  assert.equal(stats(state, 'a', dayKey(now)).total, 2);
  assert.equal(dayKey(new Date(2026, 10, 4, 0, 1)), '2026-11-04');
});
test('CSV escapes quotes, neutralizes formulas and excludes item identifiers', () => {
  const result = csv([{ id: '1', ruleName: '=HYPERLINK("x")', at: now, day: '2026-11-04', source: 'manual', entityKey: 'private-hash', undone: true }]);
  assert.ok(result.includes("'=HYPERLINK"));
  assert.ok(result.includes('""x""'));
  assert.ok(!result.includes('private-hash'));
  assert.ok(result.includes('"sim"'));
});
