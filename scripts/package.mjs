import { mkdir, cp, readdir, readFile, writeFile } from 'node:fs/promises';
import { zipSync } from 'fflate';
const { version } = JSON.parse(await readFile('extension/manifest.json', 'utf8'));
await mkdir('dist/taskelio', { recursive: true });
await cp('extension', 'dist/taskelio', { recursive: true });
async function collect(directory, prefix = '') {
  const entries = {};
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const key = prefix + entry.name;
    if (entry.isDirectory()) Object.assign(entries, await collect(`${directory}/${entry.name}`, `${key}/`));
    else if (entry.isFile()) entries[key] = new Uint8Array(await readFile(`${directory}/${entry.name}`));
  }
  return entries;
}
await writeFile(`dist/taskelio-v${version}.zip`, zipSync(await collect('extension'), { level: 9 }));
console.log(`Extensão preparada em dist/taskelio e dist/taskelio-v${version}.zip.`);
