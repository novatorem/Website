// The hero's sky, painted once per size and then left still (only nudged by CSS translates):
// by day, komorebi: the shadow of a tree on a sunlit wall (after jzhao.xyz/posts/dappled-light);
// by night, a band of the Milky Way. Both use a fixed seed, so a repaint after a resize, or a
// page refresh, shows the same sky.

// Small deterministic PRNG (mulberry32)
function seeded(seed: number) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function sized(canvas: HTMLCanvasElement, width: number, height: number, scale: number) {
	canvas.width = Math.max(1, Math.round(width * scale));
	canvas.height = Math.max(1, Math.round(height * scale));
	const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
	ctx.setTransform(scale, 0, 0, scale, 0, 0);
	return ctx;
}

type Rgb = [number, number, number];

// Accepts #rrggbb or a computed rgb()/rgba() string
function rgb(css: string): Rgb {
	if (css.startsWith('#')) {
		const n = parseInt(css.slice(1, 7), 16);
		return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
	}
	const m = css.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
	return [m[0], m[1], m[2]];
}

// ---- Day ------------------------------------------------------------------------------

// How far a limb is from the wall decides its blur: near limbs cast crisp shadows,
// far ones a wide penumbra. Three depth bins approximate that per limb.
const DEPTHS = [
	{ blur: 1.5 }, // near the wall
	{ blur: 2.4 },
	{ blur: 6 } // far from the wall
];

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

type Grow = {
	rand: () => number;
	bins: CanvasRenderingContext2D[];
	unit: number;
};

// A branch, grown recursively. At each fork the cross-sectional area is conserved
// (da Vinci's rule), and the side the smaller limb takes follows a running golden angle,
// so the alternation drifts instead of repeating. Thin tips end in a cluster of leaves.
function grow(
	g: Grow,
	x: number,
	y: number,
	angle: number,
	length: number,
	radius: number,
	depth: number,
	spin: number
) {
	const { rand, bins, unit } = g;
	const bend = (rand() - 0.5) * 0.35;
	const ex = x + Math.cos(angle + bend) * length;
	const ey = y + Math.sin(angle + bend) * length;
	// Only sturdy limbs sit close enough to the wall to cast a crisp shadow; a thin twig
	// that sharp reads as a drawn line
	const near = radius < 2.6 * unit ? 1 : 0;
	const bin = bins[Math.min(2, Math.max(near, Math.round(depth)))];
	bin.lineWidth = radius * 2;
	bin.beginPath();
	bin.moveTo(x, y);
	bin.quadraticCurveTo(
		x + Math.cos(angle) * length * 0.5,
		y + Math.sin(angle) * length * 0.5,
		ex,
		ey
	);
	bin.stroke();

	// Thin twigs carry leaves along their length; the tips end in a full cluster
	const tip = radius < 1.6 * unit;
	if (tip || radius < 3.6 * unit) {
		const leaves = tip ? 6 + Math.floor(rand() * 7) : 2 + Math.floor(rand() * 3);
		for (let i = 0; i < leaves; i++) {
			const a = angle + (rand() - 0.5) * 2.6;
			const reach = (6 + rand() * 16) * unit;
			const size = (8 + rand() * 11) * unit;
			const leafBin = bins[Math.min(2, Math.round(depth + (rand() - 0.3)))] ?? bin;
			leafBin.beginPath();
			leafBin.ellipse(
				ex + Math.cos(a) * reach,
				ey + Math.sin(a) * reach,
				size,
				size * 0.42,
				a + (rand() - 0.5) * 0.8,
				0,
				Math.PI * 2
			);
			leafBin.fill();
		}
		if (tip) return;
	}

	const share = 0.3 + rand() * 0.35;
	const r1 = radius * Math.sqrt(1 - share);
	const r2 = radius * Math.sqrt(share);
	spin += GOLDEN_ANGLE;
	const side = Math.cos(spin) >= 0 ? 1 : -1;
	const spread = 0.35 + rand() * 0.35;
	// The main limb carries on almost straight; the smaller one splays off
	grow(g, ex, ey, angle - side * spread * 0.35, length * (0.78 + rand() * 0.1), r1, depth, spin);
	grow(
		g,
		ex,
		ey,
		angle + side * spread,
		length * (0.62 + rand() * 0.15),
		r2,
		depth + (rand() - 0.45) * 0.9,
		spin
	);
}

export type DayColours = { lit: string; shadow: string; fringe: string };

// Day: `far` is the sunlit wall with the hazier part of the tree's shadow and a warm
// fringe where light meets shadow; `near` holds the crisp limbs closest to the wall.
// Both are low resolution: shadows are soft, and the upscale is part of the softness.
export function paintDay(
	far: HTMLCanvasElement,
	near: HTMLCanvasElement,
	width: number,
	height: number,
	colours: DayColours
) {
	const scale = 0.4;
	const rand = seeded(23);
	const unit = Math.max(0.8, Math.min(width, height * 1.5) / 1100);
	const bins = DEPTHS.map(() => {
		const c = document.createElement('canvas');
		const ctx = sized(c, width, height, scale);
		ctx.fillStyle = ctx.strokeStyle = '#000';
		ctx.lineCap = 'round';
		return ctx;
	});
	const g: Grow = { rand, bins, unit };
	// The tree stands off to the upper right: two limbs reach in along the right third
	grow(g, width * 1.06, -height * 0.12, 2.25, width * 0.2, 9 * unit, 0.6, 0);
	grow(g, width * 1.04, height * 0.38, 2.75, width * 0.17, 7 * unit, 1.4, 1.3);
	grow(g, width * 0.86, -height * 0.08, 1.95, width * 0.12, 4.5 * unit, 2, 2.1);

	// Blur each depth on its own, then stack the far two into the wall's shadow map
	const blurred = bins.map((bin, i) => {
		const c = document.createElement('canvas');
		const ctx = sized(c, width, height, scale);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.filter = `blur(${DEPTHS[i].blur * unit}px)`;
		ctx.drawImage(bin.canvas, 0, 0);
		return ctx;
	});

	const w = Math.round(width * scale);
	const h = Math.round(height * scale);
	const shadowMap = new Float32Array(w * h);
	for (const i of [1, 2]) {
		const data = blurred[i].getImageData(0, 0, w, h).data;
		for (let p = 0; p < w * h; p++) {
			const a = data[p * 4 + 3] / 255;
			shadowMap[p] = 1 - (1 - shadowMap[p]) * (1 - a);
		}
	}

	const lit = rgb(colours.lit);
	const shade = rgb(colours.shadow);
	const gold = rgb(colours.fringe);
	const out = sized(far, width, height, scale);
	out.setTransform(1, 0, 0, 1, 0, 0);
	const image = out.createImageData(w, h);
	const px = image.data;
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const p = y * w + x;
			const t = shadowMap[p];
			// Sharp light-to-shadow edges get a warm bloom; flat interiors never do
			const gx = shadowMap[p + (x < w - 1 ? 1 : 0)] - shadowMap[p - (x > 0 ? 1 : 0)];
			const gy = shadowMap[p + (y < h - 1 ? w : 0)] - shadowMap[p - (y > 0 ? w : 0)];
			const edge = Math.min(1, Math.hypot(gx, gy) * 9);
			const fringe = edge * (1 - Math.abs(t * 2 - 1)) * (1 - t * 0.6);
			for (let c = 0; c < 3; c++) {
				const base = lit[c] + (shade[c] - lit[c]) * t;
				px[p * 4 + c] = base + (gold[c] - base) * fringe;
			}
			// The wall glows warm in the sun and darkens where the canopy blocks it
			px[p * 4 + 3] = 255 * (0.22 * (1 - t) + 0.2 * t + 0.16 * fringe);
		}
	}
	out.putImageData(image, 0, 0);

	// The nearest limbs: crisp, in the shadow colour
	const n = sized(near, width, height, scale);
	n.setTransform(1, 0, 0, 1, 0, 0);
	n.drawImage(blurred[0].canvas, 0, 0);
	n.globalCompositeOperation = 'source-in';
	n.fillStyle = colours.shadow;
	n.fillRect(0, 0, w, h);
}

// ---- Night ----------------------------------------------------------------------------

export type NightColours = { stars: string[]; nebula: string; dust: string; ground: string };

// The band runs from lower left to upper right, above the hero's centre
function band(width: number, height: number) {
	const angle = -0.42;
	const along = [Math.cos(angle), Math.sin(angle)];
	const across = [-along[1], along[0]];
	const cx = width * 0.58;
	const cy = height * 0.42;
	return {
		angle,
		at: (u: number, v: number) => [
			cx + along[0] * u + across[0] * v,
			cy + along[1] * u + across[1] * v
		]
	};
}

// Night: nebula, a dust lane, and stars, dense along the band and sparse elsewhere
export function paintNight(
	canvas: HTMLCanvasElement,
	width: number,
	height: number,
	colours: NightColours
) {
	const rand = seeded(11);
	const scale = Math.min(window.devicePixelRatio || 1, 1.5);
	const ctx = sized(canvas, width, height, scale);
	const { angle, at } = band(width, height);
	const span = Math.hypot(width, height);
	const gauss = () => (rand() + rand() + rand() - 1.5) / 1.5;

	ctx.globalCompositeOperation = 'lighter';
	for (let i = 0; i < 24; i++) {
		const [x, y] = at((rand() - 0.5) * span * 0.95, gauss() * span * 0.06);
		const r = span * (0.05 + rand() * 0.09);
		const g = ctx.createRadialGradient(x, y, 0, x, y, r);
		g.addColorStop(0, i % 3 === 0 ? colours.dust : colours.nebula);
		g.addColorStop(1, 'transparent');
		ctx.globalAlpha = 0.05 + rand() * 0.07;
		ctx.fillStyle = g;
		ctx.fillRect(x - r, y - r, r * 2, r * 2);
	}
	// The dust lane is drawn small and blurred once, then laid over the band
	ctx.globalCompositeOperation = 'source-over';
	const lane = document.createElement('canvas');
	const l = sized(lane, width, height, 0.25);
	l.fillStyle = colours.ground;
	for (let i = 0; i < 14; i++) {
		const [x, y] = at((rand() - 0.5) * span * 0.8, gauss() * span * 0.01);
		l.globalAlpha = 0.18 + rand() * 0.2;
		l.beginPath();
		l.ellipse(x, y, span * (0.03 + rand() * 0.05), span * 0.005, angle, 0, Math.PI * 2);
		l.fill();
	}
	const soft = document.createElement('canvas');
	const sl = sized(soft, width, height, 0.25);
	sl.setTransform(1, 0, 0, 1, 0, 0);
	sl.filter = `blur(${span * 0.01 * 0.25}px)`;
	sl.drawImage(lane, 0, 0);
	ctx.drawImage(soft, 0, 0, width, height);

	const star = (x: number, y: number, r: number, alpha: number) => {
		ctx.globalAlpha = alpha;
		ctx.fillStyle = colours.stars[Math.floor(rand() * colours.stars.length)];
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();
	};
	const density = span / 1700;
	for (let i = 0; i < 1400 * density; i++) {
		const [x, y] = at((rand() - 0.5) * span, gauss() * span * 0.08);
		star(x, y, 0.35 + rand() ** 3 * 0.9, 0.18 + rand() * 0.5);
	}
	for (let i = 0; i < 380 * density; i++) {
		star(rand() * width, rand() * height, 0.4 + rand() ** 4 * 1.1, 0.12 + rand() * 0.45);
	}
	ctx.globalAlpha = 1;
}

export type Sparkle = {
	x: number;
	y: number;
	size: number;
	period: number;
	delay: number;
	spark: boolean;
};

// The few stars that twinkle, as positions in percent of the hero: mostly along the band,
// a handful scattered, a few with a four-pointed spark
export function sparkles(width: number, height: number, count: number): Sparkle[] {
	const rand = seeded(5);
	const { at } = band(width, height);
	const span = Math.hypot(width, height);
	const list: Sparkle[] = [];
	while (list.length < count) {
		const onBand = rand() < 0.7;
		const [x, y] = onBand
			? at((rand() - 0.5) * span * 0.9, (rand() - 0.5) * span * 0.14)
			: [rand() * width, rand() * height];
		if (x < 0 || y < 0 || x > width || y > height) continue;
		list.push({
			x: (x / width) * 100,
			y: (y / height) * 100,
			size: 1.6 + rand() * 1.8,
			period: 3 + rand() * 5,
			delay: -rand() * 8,
			spark: rand() < 0.3
		});
	}
	return list;
}
