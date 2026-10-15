// The weather's two glyphs: leaves by day, stars by night, in the particle colours from app.css.
import { currentLight } from '#lib/theme.ts';

export type Palette = {
	settled: string[];
	flash: string;
	spent: string;
	night: boolean;
};

// Custom properties may hold light-dark() values, so resolve them through a real element
export function readPalette(): Palette {
	const probe = document.createElement('span');
	probe.style.display = 'none';
	document.body.append(probe);
	const resolve = (name: string) => {
		probe.style.color = `var(${name})`;
		return getComputedStyle(probe).color;
	};
	const palette = {
		settled: [resolve('--particle-1'), resolve('--particle-2'), resolve('--particle-3')],
		flash: resolve('--particle-flash'),
		spent: resolve('--particle-spent'),
		night: currentLight() === 'night'
	};
	probe.remove();
	return palette;
}

// A star, with an optional four-pointed spark
export function drawStar(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
	spark: boolean
) {
	const r = size * 0.55;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.fill();
	if (spark) {
		ctx.fillRect(x - r * 3, y - 0.4, r * 6, 0.8);
		ctx.fillRect(x - 0.4, y - r * 3, 0.8, r * 6);
	}
}

// A leaf: a pointed ellipse turned by `rot`
export function drawLeaf(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
	rot: number
) {
	ctx.beginPath();
	ctx.ellipse(x, y, size * 1.15, size * 0.5, rot, 0, Math.PI * 2);
	ctx.fill();
}
