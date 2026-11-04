import { readdir, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const files = await readdir('extension');
for (const file of files.filter(f => f.endsWith('.js'))) execFileSync(process.execPath, ['--check', `extension/${file}`], { stdio: 'inherit' });
const manifest = JSON.parse(await readFile('extension/manifest.json', 'utf8'));
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
if (pkg.version !== manifest.version) throw new Error('Package and extension versions must match.');
for (const locale of ['en', 'pt_BR']) {
  const messages = JSON.parse(await readFile(`extension/_locales/${locale}/messages.json`, 'utf8'));
  for (const field of [manifest.name, manifest.description, manifest.action.default_title]) {
    const key = field.match(/^__MSG_(.+)__$/)?.[1];
    if (!key || !messages[key]?.message) throw new Error(`Missing manifest translation: ${locale} / ${field}`);
  }
}
for (const file of [manifest.background.service_worker, manifest.action.default_popup, manifest.options_page, ...Object.values(manifest.icons), ...Object.values(manifest.action.default_icon)]) await readFile(`extension/${file}`);
if (manifest.host_permissions?.length) throw new Error('Site access must remain optional.');
console.log('JavaScript e manifesto verificados.');
