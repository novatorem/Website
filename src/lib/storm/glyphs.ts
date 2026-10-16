// The weather's two glyphs: leaves by day, stars by night, in the particle colours from app.css.
import { currentLight } from '#lib/theme.ts';

export type Palette = {
	settled: string[];
	flash: string;
	spent: string;
	night: boolean;
};

// Custom properties may hold light-dark() values, so resolve them through a real element
export function resolveColors<T extends string>(names: readonly T[]): Record<T, string> {
	const probe = document.createElement('span');
	probe.style.display = 'none';
	document.body.append(probe);
	const colors = {} as Record<T, string>;
	for (const name of names) {
		probe.style.color = `var(${name})`;
		colors[name] = getComputedStyle(probe).color;
	}
	probe.remove();
	return colors;
}

export function readPalette(): Palette {
	const c = resolveColors([
		'--particle-1',
		'--particle-2',
		'--particle-3',
		'--particle-flash',
		'--particle-spent'
	] as const);
	return {
		settled: [c['--particle-1'], c['--particle-2'], c['--particle-3']],
		flash: c['--particle-flash'],
		spent: c['--particle-spent'],
		night: currentLight() === 'night'
	};
}

// The glyphs add to the current path; the caller begins and fills it

// A star (its four-pointed spark, when it has one, is drawn separately with drawSpark)
export function traceStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
	const r = size * 0.55;
	ctx.moveTo(x + r, y);
	ctx.arc(x, y, r, 0, Math.PI * 2);
}

export function drawSpark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
	const r = size * 0.55;
	ctx.fillRect(x - r * 3, y - 0.4, r * 6, 0.8);
	ctx.fillRect(x - 0.4, y - r * 3, 0.8, r * 6);
}

// A leaf: a pointed ellipse turned by `rot`
export function traceLeaf(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
	rot: number
) {
	const rx = size * 1.15;
	ctx.moveTo(x + Math.cos(rot) * rx, y + Math.sin(rot) * rx);
	ctx.ellipse(x, y, rx, size * 0.5, rot, 0, Math.PI * 2);
}
