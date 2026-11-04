import { readdir, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const files = await readdir('extension');
for (const file of files.filter(f => f.endsWith('.js'))) execFileSync(process.execPath, ['--check', `extension/${file}`], { stdio: 'inherit' });
const manifest = JSON.parse(await readFile('extension/manifest.json', 'utf8'));
for (const file of [manifest.background.service_worker, manifest.action.default_popup, manifest.options_page, ...Object.values(manifest.icons), ...Object.values(manifest.action.default_icon)]) await readFile(`extension/${file}`);
if (manifest.host_permissions?.length) throw new Error('Site access must remain optional.');
console.log('JavaScript e manifesto verificados.');
