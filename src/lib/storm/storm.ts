// Alphabet storm: particles that drift on a solar wind and condense into words.
// By day the particles are leaves; by night they are stars. The canvas is purely
// decorative; callers mirror the word in the DOM for assistive tech.
import { onLightChange } from '#lib/theme.ts';
import { drawLeaf, drawStar, readPalette } from './glyphs.ts';

type Box = { x: number; y: number; w: number; h: number };

type Particle = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	tx: number;
	ty: number;
	hasTarget: boolean;
	// When this particle starts heading for its target (a left-to-right weather front)
	startAt: number;
	// Fixed per particle, so sizes never jump when the word changes
	scale: number;
	size: number;
	// Spare particles leave once they drift out of view
	dead: boolean;
	rot: number;
	spin: number;
	tone: number;
	phase: number;
};

export type StormOptions = {
	// Element whose box the word condenses into
	word: Element;
	// Element the weather is shed from (the name); without one, loose particles wrap around
	source?: Element;
	ambient?: number;
};

const FONT = '"Archivo Variable", sans-serif';
const MAX_PARTICLES = 1600;
// Target spacing: roughly this many sample points across the word's height
const DENSITY = 26;
// Physics constants are tuned per 60fps frame; `k` rescales them to the real frame time
const FRAME = 1 / 60;

export function createStorm(canvas: HTMLCanvasElement, options: StormOptions) {
	const ctx = canvas.getContext('2d')!;
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	const particles: Particle[] = [];
	let width = 0;
	let height = 0;
	let word = '';
	let palette = readPalette();
	let frame = 0;
	let running = false;
	let destroyed = false;
	let fontReady = false;
	let onScreen = true;
	let tabVisible = !document.hidden;
	let time = 0;
	let gustUntil = 0;
	// Loose particles beyond the ambient count, removed as they leave the frame
	let excess = 0;
	let current: { dx: number; dy: number; endX: number } | null = null;

	function box(el: Element): Box {
		const c = canvas.getBoundingClientRect();
		const r = el.getBoundingClientRect();
		return { x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height };
	}

	function resize() {
		const rect = canvas.getBoundingClientRect();
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		width = rect.width;
		height = rect.height;
		canvas.width = Math.round(width * dpr);
		canvas.height = Math.round(height * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	}

	// Rasterise the word offscreen and sample its ink into target points
	function sampleTargets(text: string) {
		const target = box(options.word);
		const off = document.createElement('canvas');
		off.width = Math.max(1, Math.round(target.w));
		off.height = Math.max(1, Math.round(target.h));
		const o = off.getContext('2d')!;
		const setFont = (size: number) => {
			o.font = `900 ${size}px ${FONT}`;
			// Canvas takes width as a keyword (and the font shorthand resets it);
			// extra-condensed is the font's 62% width
			if ('fontStretch' in o) o.fontStretch = 'extra-condensed';
		};
		let size = target.h;
		setFont(size);
		const measured = o.measureText(text).width;
		if (measured > target.w) size = (size * target.w) / measured;
		setFont(size);
		o.textAlign = 'right';
		o.fillText(text, off.width, off.height * 0.92);
		const data = o.getImageData(0, 0, off.width, off.height).data;
		const step = Math.max(3, Math.round(size / DENSITY));
		const points: { x: number; y: number }[] = [];
		for (let y = 0; y < off.height; y += step) {
			for (let x = 0; x < off.width; x += step) {
				if (data[(y * off.width + x) * 4 + 3] > 140) {
					// Jitter each point inside its cell so the word reads as weather, not a grid
					points.push({
						x: target.x + x + (Math.random() - 0.5) * step * 0.9,
						y: target.y + y + (Math.random() - 0.5) * step * 0.9
					});
				}
			}
		}
		// Shuffle so particles pick targets across the whole word
		for (let i = points.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[points[i], points[j]] = [points[j], points[i]];
		}
		return { points: points.slice(0, MAX_PARTICLES), size, target };
	}

	function spawn(x: number, y: number): Particle {
		return {
			x,
			y,
			vx: 0,
			vy: 0,
			tx: x,
			ty: y,
			hasTarget: false,
			startAt: 0,
			scale: 0.7 + Math.random() * 0.6,
			size: 0,
			dead: false,
			rot: Math.random() * Math.PI * 2,
			spin: (Math.random() - 0.5) * 0.04,
			tone: Math.floor(Math.random() * 3),
			phase: Math.random() * Math.PI * 2
		};
	}

	// Direction of travel from the name to the word
	function measureCurrent(target: Box) {
		if (!options.source) return (current = null);
		const source = box(options.source);
		const dx = target.x + target.w * 0.5 - (source.x + source.w);
		const dy = target.y + target.h * 0.5 - (source.y + source.h * 0.5);
		const len = Math.hypot(dx, dy) || 1;
		current = { dx: dx / len, dy: dy / len, endX: Math.min(width + 20, target.x + target.w + 40) };
	}

	// Shed a particle from the trailing edge of the name's letters
	function shed(p: Particle) {
		if (!options.source) return;
		const source = box(options.source);
		p.x = source.x + source.w * (0.55 + Math.random() * 0.45);
		p.y = source.y + source.h * (0.1 + Math.random() * 0.8);
		p.vx = 0.5 + Math.random();
		p.vy = (Math.random() - 0.5) * 0.6;
	}

	function pin() {
		for (const p of particles) {
			if (p.hasTarget) {
				p.x = p.tx;
				p.y = p.ty;
			}
			p.vx = p.vy = 0;
		}
		draw();
	}

	// The new word's points go to particles in left-to-right order, so one word morphs
	// into the next instead of scattering. Holders the word no longer needs drift off on
	// the current; extra points are filled from the loose sky, then shed from the name.
	function condense(gust: boolean) {
		const { points, size, target } = sampleTargets(word);
		measureCurrent(target);
		points.sort((a, b) => a.x - b.x);
		const ambient = options.ambient ?? 140;
		const holders = particles.filter((p) => p.hasTarget).sort((a, b) => a.x - b.x);
		const loose = particles.filter((p) => !p.hasTarget);
		const n = points.length;
		const m = holders.length;
		const assigned: (Particle | undefined)[] = new Array(n);
		// The first word arrives as a burst blown out of the whole name; later words morph
		const arriving = m === 0;

		if (m >= n) {
			for (let i = 0; i < n; i++) assigned[i] = holders[Math.floor((i * m) / n)];
			const kept = new Set(assigned);
			for (const p of holders) if (!kept.has(p)) p.hasTarget = false;
		} else {
			for (let j = 0; j < m; j++) assigned[Math.floor((j * n) / m)] = holders[j];
		}
		for (let i = 0; i < n; i++) {
			if (assigned[i]) continue;
			let p = loose.pop();
			if (!p) {
				p = fresh(arriving);
				particles.push(p);
			}
			assigned[i] = p;
		}
		// Top the sky back up to its ambient count
		let looseCount = particles.length - n;
		while (looseCount < ambient) {
			particles.push(fresh(arriving));
			looseCount++;
		}
		excess = looseCount - ambient;

		const baseSize = Math.max(1.6, Math.min(4.2, size / 46));
		for (const p of particles) p.size = baseSize * p.scale;
		assigned.forEach((p, i) => {
			const point = points[i];
			const front = (point.x - target.x) / Math.max(1, target.w);
			p!.hasTarget = true;
			p!.tx = point.x;
			p!.ty = point.y;
			// A weather front: letters condense left to right (a longer sweep on arrival)
			p!.startAt =
				time +
				(arriving ? front * 0.9 + Math.random() * 0.35 : front * 0.45 + Math.random() * 0.15);
			if (gust && !arriving) {
				p!.vx += 0.8 + Math.random() * 1.6;
				p!.vy -= 0.3 + Math.random() * 0.8;
			}
		});
		if (gust && arriving) {
			for (const p of particles) {
				p.vx += 4 + Math.random() * 6;
				p.vy -= 1 + Math.random() * 3;
			}
		}
		gustUntil = time + (arriving ? 0.6 : 0.35);

		if (reduceMotion.matches) pin();
		else start();
	}

	// A new particle: scattered through the whole name for the first burst, shed from its
	// trailing edge afterwards, or dropped anywhere when there is no name
	function fresh(arriving = false) {
		if (arriving && options.source) {
			const source = box(options.source);
			return spawn(source.x + Math.random() * source.w, source.y + Math.random() * source.h);
		}
		const p = spawn(Math.random() * width, Math.random() * height);
		shed(p);
		return p;
	}

	function setWord(next: string, { gust = true } = {}) {
		word = next.toUpperCase();
		if (fontReady && !destroyed) condense(gust);
	}

	// A soft, deterministic flow field: the solar wind blowing west to east
	function wind(x: number, y: number, t: number) {
		const a = Math.sin(y * 0.006 + t * 0.4) + Math.sin(x * 0.004 - t * 0.25);
		return { x: 0.35 + a * 0.18, y: Math.cos(x * 0.005 + t * 0.3) * 0.22 };
	}

	function step(dt: number) {
		time += dt;
		const k = dt / FRAME;
		const gusting = time < gustUntil;
		const looseDamping = (gusting ? 0.96 : 0.92) ** k;
		const springDamping = 0.78 ** k;
		for (const p of particles) {
			if (p.hasTarget && time > p.startAt) {
				const dx = p.tx - p.x;
				const dy = p.ty - p.y;
				p.vx = (p.vx + dx * 0.045 * k) * springDamping;
				p.vy = (p.vy + dy * 0.045 * k) * springDamping;
				// Settled leaves still breathe in the wind
				if (Math.abs(dx) + Math.abs(dy) < 2) p.x += Math.sin(time * 1.3 + p.phase) * 0.06 * k;
			} else {
				const w = wind(p.x, p.y, time);
				p.vx = p.vx * looseDamping + w.x * k;
				p.vy = p.vy * looseDamping + w.y * k;
				if (current) {
					// The current: loose particles stream from the name toward the word
					p.vx += current.dx * 0.05 * k;
					p.vy += current.dy * 0.05 * k;
				}
				// A particle still waiting for its letter keeps it, even if the gust carries it
				// off-frame; retiring it would leave a hole at the word's trailing edge
				const edge = current ? current.endX : width + 20;
				if (!p.hasTarget && (p.x > edge || p.x < -20 || p.y > height + 20 || p.y < -20)) {
					recycle(p);
				}
			}
			p.x += p.vx * k;
			p.y += p.vy * k;
			p.rot += (p.spin + p.vx * 0.01) * k;
		}
		if (particles.some((p) => p.dead)) {
			const alive = particles.filter((p) => !p.dead);
			particles.length = 0;
			particles.push(...alive);
		}
	}

	// A loose particle that left the frame: retire it if the sky has spares, else bring it back
	function recycle(p: Particle) {
		if (excess > 0) {
			p.dead = true;
			excess--;
		} else if (current) {
			shed(p);
		} else {
			// No name to shed from: wrap around to the opposite edge
			if (p.x > width + 20) p.x = -20;
			else if (p.x < -20) p.x = width + 20;
			if (p.y > height + 20) p.y = -20;
			else if (p.y < -20) p.y = height + 20;
		}
	}

	function draw() {
		ctx.clearRect(0, 0, width, height);
		const { settled, flash, spent, night } = palette;
		for (const p of particles) {
			const inTransit = p.hasTarget && Math.abs(p.vx) + Math.abs(p.vy) > 0.8;
			if (!p.hasTarget) ctx.fillStyle = night ? settled[p.tone] : spent;
			else ctx.fillStyle = inTransit ? flash : settled[p.tone];
			if (night) {
				// Stars twinkle, with the odd four-pointed spark; loose ones are the dimmer sky
				const twinkle = 0.65 + 0.35 * Math.sin(time * 2 + p.phase);
				ctx.globalAlpha = p.hasTarget ? twinkle : twinkle * 0.45;
				drawStar(ctx, p.x, p.y, p.size, p.tone === 0 && p.phase < 0.35);
			} else {
				// Leaves turn in the wind
				ctx.globalAlpha = p.hasTarget ? 1 : 0.7;
				drawLeaf(ctx, p.x, p.y, p.size, p.rot);
			}
		}
		ctx.globalAlpha = 1;
	}

	let last = 0;
	function loop(now: number) {
		const dt = Math.min(0.05, last ? (now - last) / 1000 : FRAME);
		last = now;
		step(dt);
		draw();
		frame = requestAnimationFrame(loop);
	}

	function start() {
		if (running || destroyed || !onScreen || !tabVisible || reduceMotion.matches) return;
		running = true;
		last = 0;
		frame = requestAnimationFrame(loop);
	}

	function stop() {
		running = false;
		cancelAnimationFrame(frame);
	}

	const sync = () => (onScreen && tabVisible ? start() : stop());

	// Only animate while the storm is on screen and the tab is visible
	const io = new IntersectionObserver(([entry]) => {
		onScreen = entry.isIntersecting;
		sync();
	});
	io.observe(canvas);
	const onVisibility = () => {
		tabVisible = !document.hidden;
		sync();
	};
	document.addEventListener('visibilitychange', onVisibility);

	let resizeTimer = 0;
	const onResize = () => {
		clearTimeout(resizeTimer);
		resizeTimer = window.setTimeout(() => {
			resize();
			if (word) setWord(word, { gust: false });
		}, 150);
	};
	window.addEventListener('resize', onResize);

	const stopWatchingLight = onLightChange(() => {
		palette = readPalette();
		if (!running) draw();
	});

	const onMotion = () => {
		if (reduceMotion.matches) {
			stop();
			pin();
		} else start();
	};
	reduceMotion.addEventListener('change', onMotion);

	resize();
	document.fonts.load(`900 100px ${FONT}`).finally(() => {
		fontReady = true;
		if (word) setWord(word);
	});

	return {
		setWord,
		// Whether the weather is currently on screen and animating
		isActive: () => onScreen && tabVisible && !destroyed,
		destroy() {
			destroyed = true;
			stop();
			clearTimeout(resizeTimer);
			io.disconnect();
			stopWatchingLight();
			document.removeEventListener('visibilitychange', onVisibility);
			window.removeEventListener('resize', onResize);
			reduceMotion.removeEventListener('change', onMotion);
		}
	};
}

export type Storm = ReturnType<typeof createStorm>;
