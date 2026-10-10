// Regenerates the tab icons in static/ from src/lib/logo.ts and the app.css colour tokens.
// Run after changing either: `node scripts/tab-icons.mjs`
//   favicon.svg        follows the OS light by itself (no script, so browsers never re-fetch)
//   favicon-day.svg    used when the visitor forces a light with the toggle
//   favicon-night.svg
//   favicon-day.png    the apple-touch-icon
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const logo = readFileSync(new URL('../src/lib/logo.ts', import.meta.url), 'utf8');
const points = logo.match(/LOGO_POINTS = '([^']+)'/)[1];
// Colours come from the light-dark() tokens in app.css, so the icons always match the site
const css = readFileSync(new URL('../src/app.css', import.meta.url), 'utf8');
const token = (name) =>
	css.match(new RegExp(`--${name}: light-dark\\((#[0-9a-f]+), (#[0-9a-f]+)\\)`, 'i')).slice(1);
const [topDay, topNight] = token('logo-top');
const [bottomDay, bottomNight] = token('flash');

const icon = (top, bottom, style = '') =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 322 322">${style}<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop class="top" offset="0" stop-color="${top}"/><stop class="bottom" offset="1" stop-color="${bottom}"/></linearGradient></defs><polygon fill="url(#g)" points="${points}"/></svg>\n`;
const write = (name, content) =>
	writeFileSync(new URL(`../static/${name}`, import.meta.url), content);

write(
	'favicon.svg',
	icon(
		topDay,
		bottomDay,
		`<style>@media (prefers-color-scheme: dark){.top{stop-color:${topNight}}.bottom{stop-color:${bottomNight}}}</style>`
	)
);
write('favicon-day.svg', icon(topDay, bottomDay));
write('favicon-night.svg', icon(topNight, bottomNight));
await sharp(Buffer.from(icon(topDay, bottomDay)), { density: 144 })
	.resize(192, 192)
	.png({ compressionLevel: 9 })
	.toFile(new URL('../static/favicon-day.png', import.meta.url).pathname);
