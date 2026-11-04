import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { messages, resolveLanguage } from '../extension/i18n.js';
import { csv } from '../extension/core.js';

test('language choice respects the saved preference and falls back to English', () => {
  assert.equal(resolveLanguage(undefined, 'pt-PT'), 'pt-BR');
  assert.equal(resolveLanguage(undefined, 'en-US'), 'en');
  assert.equal(resolveLanguage(undefined, 'de-DE'), 'en');
  assert.equal(resolveLanguage('en', 'pt-BR'), 'en');
  assert.equal(resolveLanguage('pt-BR', 'en-US'), 'pt-BR');
  assert.equal(resolveLanguage('invalid', 'pt-BR'), 'pt-BR');
});
test('both languages provide the same interpolation fields', () => {
  for (const [key, values] of Object.entries(messages)) {
    assert.equal(values.length, 2, key);
    for (const value of values) assert.ok(value.trim(), key);
    const placeholders = value => [...value.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
    assert.deepEqual(placeholders(values[0]), placeholders(values[1]), key);
  }
});
test('HTML translation markers and service error codes have translations', async () => {
  for (const file of ['app.html', 'popup.html']) {
    const source = await readFile(`extension/${file}`, 'utf8');
    for (const match of source.matchAll(/data-i18n(?:-placeholder|-aria-label)?="([^"]+)"/g)) assert.ok(messages[match[1]], `${file}: ${match[1]}`);
  }
  for (const file of ['core.js', 'background.js']) {
    const source = await readFile(`extension/${file}`, 'utf8');
    for (const match of source.matchAll(/new Error\('([^']+)'\)/g)) assert.ok(messages[match[1]], `${file}: ${match[1]}`);
  }
});
test('CSV translates headers and flags without changing user-defined counter names', () => {
  const event = { id: '1', ruleName: 'Leads qualificados', at: 0, day: '1970-01-01', source: 'manual', undone: true };
  const english = csv([event], 'en'), portuguese = csv([event], 'pt-BR');
  assert.ok(english.includes('"counter","utc_time"'));
  assert.ok(english.includes('"yes"'));
  assert.ok(portuguese.includes('"contador","horario_utc"'));
  assert.ok(portuguese.includes('"sim"'));
  assert.ok(english.includes('Leads qualificados'));
});
