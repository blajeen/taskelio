import { test, expect, chromium } from '@playwright/test';
import { mkdtemp, cp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:http';

let context, root, server, origin, extensionId;
test.beforeAll(async () => {
  server = createServer((request, response) => {
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(`<!doctype html><html><body><h1>CRM de teste</h1><label>Qualified <select id="qualified"><option>No</option><option>Yes</option></select></label><button id="complete">Finalizar</button><span id="record" data-id="person-1">Registro</span><script>window.siteClicks=0;document.querySelector('#complete').addEventListener('click',()=>window.siteClicks++);if(location.pathname.endsWith('/completed'))document.querySelector('#qualified').value='Yes';</script></body></html>`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  root = await mkdtemp(path.join(tmpdir(), 'taskelio-test-'));
  const extension = path.join(root, 'extension');
  await cp(path.resolve('extension'), extension, { recursive: true });
  // Pregrant only the local fixture in this disposable test copy. Production uses optional permissions.
  const manifestPath = path.join(extension, 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  manifest.host_permissions = ['http://127.0.0.1/*'];
  await writeFile(manifestPath, JSON.stringify(manifest));
  context = await chromium.launchPersistentContext(path.join(root, 'profile'), {
    channel: 'chromium', headless: true, locale: 'pt-BR', viewport: { width: 1365, height: 1000 },
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`]
  });
  const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
  extensionId = new URL(worker.url()).host;
});
test.afterAll(async () => {
  await context?.close();
  if (server) await new Promise(resolve => server.close(resolve));
  if (root && path.dirname(path.resolve(root)) === path.resolve(tmpdir()) && path.basename(root).startsWith('taskelio-test-')) await rm(root, { recursive: true, force: true });
});

test('real extension: rules, transitions, deduplication, visits, picker, corrections and export', async () => {
  const crm = await context.newPage();
  await crm.goto(origin + '/person/1');
  const app = await context.newPage();
  const errors = [];
  app.on('pageerror', error => errors.push(error.message));
  app.on('console', message => { if (message.type() === 'error') console.error(message.text()); });
  await app.goto(`chrome-extension://${extensionId}/app.html`);
  expect(errors).toEqual([]);
  await expect(app.locator('#counter-list').getByText('O primeiro passo é seu.')).toBeVisible();
  async function createRule(name, trigger, selector, value) {
    await app.locator('#new-rule').click();
    await app.locator('[name=name]').fill(name);
    await app.locator('[name=origin]').fill(origin);
    await app.locator('[name=path]').fill('/person/*');
    await app.locator('[name=trigger]').selectOption(trigger);
    if (selector) await app.locator('[name=selector]').fill(selector);
    if (value) await app.locator('[name=value]').fill(value);
    await app.locator('[name=goal]').fill('20');
    await app.locator('#save-rule').click();
    await expect(app.locator('#rule-dialog')).not.toBeVisible();
  }
  await createRule('Leads qualificados', 'field', '#qualified', 'Yes');
  await expect(app.locator('#metric-today')).toHaveText('0');
  await crm.locator('#qualified').selectOption('Yes');
  await expect(app.locator('#metric-today')).toHaveText('1');
  await crm.locator('#qualified').selectOption('No');
  await crm.locator('#qualified').selectOption('Yes');
  await expect.poll(async () => {
    const state = await app.evaluate(async () => (await chrome.runtime.sendMessage({ type: 'GET_STATE' })).data);
    return state.events.length;
  }).toBe(1);

  // Opening an already-completed profile establishes a baseline, including after a reload.
  await crm.goto(origin + '/person/completed');
  await expect(crm.locator('#qualified')).toHaveValue('Yes');
  await app.waitForTimeout(1400);
  await expect(app.locator('#metric-today')).toHaveText('1');
  await createRule('Perfis consultados', 'visit');
  await crm.goto(origin + '/person/2');
  await expect(app.locator('#metric-today')).toHaveText('2');
  await crm.evaluate(() => history.pushState({}, '', '/person/3'));
  await expect(app.locator('#metric-today')).toHaveText('3');
  await crm.reload();
  await app.waitForTimeout(1400);
  await expect(app.locator('#metric-today')).toHaveText('3');

  // Rules are reloaded in already-open pages, not only after navigation.
  await app.locator('#counter-list .counter-card').filter({ hasText: 'Perfis consultados' }).getByText('Pausar', { exact: true }).click();
  await crm.goto(origin + '/person/4');
  await app.waitForTimeout(1400);
  await expect(app.locator('#metric-today')).toHaveText('3');
  await createRule('Ações finalizadas', 'click', '#complete');
  await crm.locator('#complete').click();
  await expect(app.locator('#metric-today')).toHaveText('4');
  await app.locator('#counter-list .counter-card').filter({ hasText: 'Leads qualificados' }).getByText('Adicionar 1', { exact: false }).click();
  await expect(app.locator('#metric-today')).toHaveText('5');
  await app.locator('[data-view=history]').click();
  await app.locator('#history-body tr').first().getByText('Desfazer').click();
  await expect(app.locator('#history-body tr').first()).toContainText('Desfeito');
  const downloadPromise = app.waitForEvent('download');
  await app.locator('#export').click();
  const download = await downloadPromise;
  const exported = await readFile(await download.path(), 'utf8');
  expect(exported).toContain('Leads qualificados');
  expect(exported).not.toContain('person/');

  // Selection does not execute the site's click or increment a counter.
  await app.locator('#new-rule').click();
  await app.locator('[name=origin]').fill(origin);
  await app.locator('#pick-element').click();
  await expect(crm.getByText('Taskelio · Clique no elemento desejado. Esc para cancelar.')).toBeVisible();
  await crm.locator('#complete').click();
  await expect(app.locator('[name=selector]')).toHaveValue('#complete');
  expect(await crm.evaluate(() => window.siteClicks)).toBe(1);
  await app.locator('#cancel-dialog').click();
  await app.locator('[data-view=overview]').click();
  await expect(app.locator('#metric-today')).toHaveText('4');
  await expect(app.locator('#toast')).not.toBeVisible();
  await app.screenshot({ path: 'test-results/taskelio-dashboard.png', fullPage: true });
  expect(errors).toEqual([]);

  // Raw record identifiers and visited URLs never enter the event history.
  const state = await app.evaluate(async () => (await chrome.runtime.sendMessage({ type: 'GET_STATE' })).data);
  for (const event of state.events.filter(e => e.source === 'browser')) {
    expect(event.entityKey).toMatch(/^[a-f0-9]{64}$/);
    expect(event).not.toHaveProperty('url');
  }
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(popup.locator('#total')).toHaveText('4');

  // History cannot be read by a page-side observer.
  const blocked = await app.evaluate(async () => {
    const [tab] = await chrome.tabs.query({ url: 'http://127.0.0.1/*' });
    const [result] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => chrome.runtime.sendMessage({ type: 'GET_STATE' }) });
    return result.result;
  });
  expect(blocked.ok).toBe(false);
});

test('concurrent additions persist without lost updates and survive a panel reload', async () => {
  const app = await context.newPage();
  await app.goto(`chrome-extension://${extensionId}/app.html`);
  const result = await app.evaluate(async () => {
    const before = (await chrome.runtime.sendMessage({ type: 'GET_STATE' })).data;
    const replies = await Promise.all(Array.from({ length: 20 }, () => chrome.runtime.sendMessage({ type: 'MANUAL', id: before.rules[0].id })));
    const after = (await chrome.runtime.sendMessage({ type: 'GET_STATE' })).data;
    return { before: before.events.length, after: after.events.length, ok: replies.every(r => r.ok) };
  });
  expect(result.ok).toBe(true);
  expect(result.after - result.before).toBe(20);
  await app.reload();
  await expect(app.locator('#metric-today')).toHaveText('24');
});

test('English persists across panels and popup; switching languages preserves rules and history', async () => {
  const app = await context.newPage();
  const errors = [];
  app.on('pageerror', error => errors.push(error.message));
  await app.goto(`chrome-extension://${extensionId}/app.html`);
  const snapshot = await app.evaluate(async () => (await chrome.runtime.sendMessage({ type: 'GET_STATE' })).data);
  await expect(app.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await app.locator('#language').selectOption('en');
  await expect(app.locator('#new-rule')).toHaveText('＋ New counter');
  await expect(app.locator('#page-title')).toHaveText('Every task counts.');
  await app.reload();
  await expect(app.locator('html')).toHaveAttribute('lang', 'en');
  await expect(app.locator('#language')).toHaveValue('en');
  await expect(app.locator('#metric-today')).toHaveText('24');
  const after = await app.evaluate(async () => (await chrome.runtime.sendMessage({ type: 'GET_STATE' })).data);
  expect(after).toEqual(snapshot);
  await expect(app.locator('#counter-list')).toContainText('Leads qualificados');
  await expect(app.locator('#counter-list')).toContainText('Field changed');
  await app.locator('#new-rule').click();
  await expect(app.locator('#dialog-title')).toHaveText('New counter');
  await expect(app.locator('[name=name]')).toHaveAttribute('placeholder', 'e.g. Qualified leads');
  await app.locator('[name=origin]').fill(origin);
  await app.locator('[name=selector]').fill('[');
  await app.locator('#test-rule').click();
  await expect(app.locator('#form-feedback')).toHaveText('The CSS selector is invalid.');
  await app.locator('[name=selector]').fill('#qualified');
  await app.locator('#test-rule').click();
  await expect(app.locator('#form-feedback')).toContainText('1 element(s) found.');
  const crm = context.pages().find(p => p.url().startsWith(origin));
  await app.locator('#pick-element').click();
  await expect(crm.getByText('Taskelio · Click the element you want. Press Esc to cancel.')).toBeVisible();
  await crm.locator('#qualified').click();
  await expect(app.locator('#form-feedback')).toContainText('Element selected.');
  await app.locator('#cancel-dialog').click();
  await app.locator('[data-view=history]').click();
  await expect(app.locator('#page-title')).toHaveText('A record of every step.');
  await expect(app.locator('#history-body')).toContainText('Automatic');
  const downloadPromise = app.waitForEvent('download');
  await app.locator('#export').click();
  const exported = await readFile(await (await downloadPromise).path(), 'utf8');
  expect(exported).toContain('"counter","utc_time"');
  expect(exported).toContain('Leads qualificados');
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(popup.locator('#open')).toHaveText('Open my dashboard ↗');
  await expect(popup.locator('#total')).toHaveText('24');
  await popup.locator('#language').selectOption('pt-BR');
  await expect(app.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(app.locator('#page-title')).toHaveText('Um registro de cada passo.');
  await app.locator('#language').selectOption('en');
  await expect(popup.locator('#open')).toHaveText('Open my dashboard ↗');
  await app.locator('[data-view=overview]').click();
  await app.screenshot({ path: 'test-results/taskelio-dashboard-en.png', fullPage: true });
  expect(errors).toEqual([]);
});
