// Screenshots of built pages at phone and desktop widths: node scripts/check/screens.mjs <outdir> [path...]
import { chromium } from '@playwright/test';
const [out, ...paths] = process.argv.slice(2);
const base = process.env.BASE ?? 'http://localhost:4173';
const browser = await chromium.launch();
for (const [name, viewport, scale] of [['phone', { width: 360, height: 780 }, 2], ['desktop', { width: 1280, height: 900 }, 1]]) {
	const page = await browser.newPage({ viewport, deviceScaleFactor: scale, colorScheme: process.env.DARK ? 'dark' : 'light' });
	page.on('console', (m) => m.type() === 'error' && console.log('console:', m.text()));
	page.on('pageerror', (e) => console.log('pageerror:', e.message));
	for (const p of paths.length ? paths : ['/']) {
		await page.goto(base + p, { waitUntil: 'networkidle' });
		await page.waitForTimeout(400);
		const file = `${out}/${name}${p.replace(/\//g, '_')}.png`;
		await page.screenshot({ path: file, fullPage: !!process.env.FULL });
		console.log(file);
	}
	await page.close();
}
await browser.close();
