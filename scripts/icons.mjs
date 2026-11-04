import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chromium', headless: true });
try {
  const page = await browser.newPage();
  const svg = await readFile('extension/icons/taskelio.svg', 'utf8');
  for (const size of [16, 32, 48, 128, 512]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<style>html,body{margin:0;width:100%;height:100%}svg{display:block;width:100%;height:100%}</style>${svg}`);
    await page.screenshot({ path: `extension/icons/icon-${size}.png`, omitBackground: true });
  }
} finally { await browser.close(); }
