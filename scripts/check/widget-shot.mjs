// Screenshot each widget card on a page at phone width: node scripts/check/widget-shot.mjs <outdir> <path> [clickPlay]
import { chromium } from '@playwright/test';
const [out, path, play] = process.argv.slice(2);
const base = process.env.BASE ?? 'http://localhost:4173';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, colorScheme: process.env.DARK ? 'dark' : 'light' });
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && console.log('console:', m.type(), m.text().slice(0, 300)));
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.goto(base + path, { waitUntil: 'networkidle' });
const cards = page.locator('section.widget');
const n = await cards.count();
for (let i = 0; i < n; i++) {
	const c = cards.nth(i);
	await c.scrollIntoViewIfNeeded();
	if (play) {
		await c.getByRole('button', { name: /듣기|켜기/ }).first().click();
		await page.waitForTimeout(Number(play));
	}
	await c.screenshot({ path: `${out}/w${i}.png` });
	console.log(`${out}/w${i}.png`);
}
if (play) {
	await page.screenshot({ path: `${out}/viewport.png` });
	console.log(`${out}/viewport.png`);
}
await browser.close();
