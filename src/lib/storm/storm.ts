// Alphabet storm: particles that drift on a solar wind and condense into words.
// By day the particles are leaves; by night they are stars. The canvas is purely
// decorative; callers mirror the word in the DOM for assistive tech.
import { onLightChange } from '#lib/theme.ts';
import { drawSpark, readPalette, traceLeaf, traceStar } from './glyphs.ts';

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
	// A particle on a letter keeps it until the front reaches it, then takes its next
	// target (or is released to the wind) with a small gust of its own
	pending: boolean;
	nx: number;
	ny: number;
	release: boolean;
	kx: number;
	ky: number;
	// Fixed per particle, so sizes never jump when the word changes
	scale: number;
	size: number;
	// Spares were released by a shorter word: they leave once out of view, instead of
	// being shed from the name again
	spare: boolean;
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
const MAX_PARTICLES = 2000;
// Target spacing: roughly this many sample points across the word's height
const DENSITY = 30;
// Physics constants are tuned per 60fps frame; `k` rescales them to the real frame time
const FRAME = 1 / 60;
// Seconds for the loose sky to fill in after the first word arrives
const SKY_FILL_S = 6;
// Seconds to top the sky back up after a word takes some of it
const SKY_TOPUP_S = 2.5;
// Share of the drifting sky that re-enters from the west edge rather than from the name
const WEST_SHARE = 0.4;

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
	let current: { dx: number; dy: number; endX: number } | null = null;
	// The loose sky still to come in, released a few at a time after the first word lands
	let queued = 0;
	let emitRate = 0;
	let emitted = 0;
	let baseSize = 2;

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
			pending: false,
			nx: x,
			ny: y,
			release: false,
			kx: 0,
			ky: 0,
			scale: 0.7 + Math.random() * 0.6,
			size: 0,
			spare: false,
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
		// The solar wind always blows east: the current leans toward the word but never turns
		// down or back (on phones the word sits below the name, even left of its end)
		const angle = Math.min(0.4, Math.max(-0.3, Math.atan2(dy, Math.max(dx, 1))));
		// Loose weather crosses the whole hero and leaves off the east edge, on every screen
		current = { dx: Math.cos(angle), dy: Math.sin(angle), endX: width + 20 };
	}

	// Shed a particle from the trailing edge of the name's letters
	// Particles come out of the name's trailing edge; with `west`, some blow in from the
	// west edge at any height instead, so the sky fills the whole hero, not one stream
	function shed(p: Particle, west = 0) {
		if (!options.source) return;
		if (Math.random() < west) {
			p.x = -10;
			p.y = Math.random() * height;
			p.vx = 0.2 + Math.random() * 0.5;
			p.vy = (Math.random() - 0.5) * 0.3;
			return;
		}
		const source = box(options.source);
		p.x = source.x + source.w * (0.55 + Math.random() * 0.45);
		p.y = source.y + source.h * (0.1 + Math.random() * 0.8);
		p.vx = 0.3 + Math.random() * 0.7;
		p.vy = (Math.random() - 0.5) * 0.4;
	}

	function pin() {
		// Under reduced motion the sky that was still to come is simply there, scattered
		for (; queued > 0; queued--)
			particles.push(sized(spawn(Math.random() * width, Math.random() * height)));
		for (const p of particles) {
			if (p.pending) depart(p);
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
		// New letters draw from the whole loose sky, in random order (spares last in the list, so
		// they're used first): the most recently shed sit together at the name, and taking them
		// in order would send a tight clump flying to the word
		const loose = particles.filter((p) => !p.hasTarget);
		for (let i = loose.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[loose[i], loose[j]] = [loose[j], loose[i]];
		}
		loose.sort((a, b) => +a.spare - +b.spare);
		const n = points.length;
		const m = holders.length;
		const assigned: (Particle | undefined)[] = new Array(n);
		// The first word arrives as a burst blown out of the whole name; later words morph
		const arriving = m === 0;

		if (m >= n) {
			for (let i = 0; i < n; i++) assigned[i] = holders[Math.floor((i * m) / n)];
		} else {
			for (let j = 0; j < m; j++) assigned[Math.floor((j * n) / m)] = holders[j];
		}
		const kept = new Set(assigned);
		for (let i = 0; i < n; i++) {
			if (assigned[i]) continue;
			let p = loose.pop();
			if (!p) {
				// Short of sky: the extra blow in from the west at any height, not from one spot
				p = fresh(arriving, 1);
				particles.push(p);
			}
			p.spare = false;
			assigned[i] = p;
		}
		// Top the sky back up to its ambient count, a few at a time: on arrival only the word
		// bursts out of the name, and after a change the sky refills without a burst
		let looseCount = particles.length - n + queued;
		if (looseCount < ambient) {
			queued += ambient - looseCount;
			emitRate = queued / (arriving ? SKY_FILL_S : SKY_TOPUP_S);
			looseCount = ambient;
		}
		// Anything beyond the ambient sky is spare: the holders this word lets go of
		let spare = looseCount - ambient;
		for (const p of particles) {
			if (spare <= 0) break;
			if (!p.hasTarget && p.spare) spare--;
		}
		for (const p of holders) {
			if (spare <= 0) break;
			if (!kept.has(p)) {
				p.spare = true;
				spare--;
			}
		}

		baseSize = Math.max(1.6, Math.min(4.2, size / 46));
		for (const p of particles) p.size = baseSize * p.scale;
		// A weather front: the word changes left to right, in step with the sweep through
		// NOVAC (a longer sweep on arrival)
		const frontAt = (x: number) => {
			const front = Math.min(1, Math.max(0, (x - target.x) / Math.max(1, target.w)));
			return (
				time + (arriving ? front * 0.9 + Math.random() * 0.35 : front * 0.7 + Math.random() * 0.12)
			);
		};
		const kick = (p: Particle) => {
			p.kx = gust ? 0.8 + Math.random() * 1.6 : 0;
			p.ky = gust ? -(0.3 + Math.random() * 0.8) : 0;
		};
		// Holders the new word doesn't need leave their letter when the front reaches them
		for (const p of holders) {
			if (kept.has(p)) continue;
			p.pending = true;
			p.release = true;
			p.startAt = frontAt(p.x);
			kick(p);
		}
		assigned.forEach((p, i) => {
			const point = points[i];
			p!.startAt = frontAt(p!.hasTarget ? p!.x : point.x);
			if (p!.hasTarget) {
				// Already on a letter: hold it until the front arrives, then move across
				p!.pending = true;
				p!.release = false;
				p!.nx = point.x;
				p!.ny = point.y;
				kick(p!);
			} else {
				p!.hasTarget = true;
				p!.tx = point.x;
				p!.ty = point.y;
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
	function sized(p: Particle) {
		p.size = baseSize * p.scale;
		return p;
	}

	function fresh(arriving = false, west = 0) {
		if (arriving && options.source) {
			const source = box(options.source);
			return spawn(source.x + Math.random() * source.w, source.y + Math.random() * source.h);
		}
		const p = spawn(Math.random() * width, Math.random() * height);
		shed(p, west);
		return p;
	}

	function setWord(next: string, { gust = true } = {}) {
		word = next.toUpperCase();
		if (fontReady && !destroyed) condense(gust);
	}

	// A soft, deterministic flow field: the solar wind blowing west to east
	function wind(x: number, y: number, t: number) {
		const a = Math.sin(y * 0.006 + t * 0.4) + Math.sin(x * 0.004 - t * 0.25);
		return { x: 0.22 + a * 0.12, y: Math.cos(x * 0.005 + t * 0.3) * 0.16 };
	}

	// The front reached this particle: take the next letter, or let go
	function depart(p: Particle) {
		p.pending = false;
		if (p.release) p.hasTarget = false;
		else {
			p.tx = p.nx;
			p.ty = p.ny;
		}
		p.vx += p.kx;
		p.vy += p.ky;
	}

	function step(dt: number) {
		time += dt;
		if (queued > 0) {
			emitted += emitRate * dt;
			for (; emitted >= 1 && queued > 0; emitted--, queued--) {
				particles.push(sized(fresh(false, WEST_SHARE)));
			}
		}
		const k = dt / FRAME;
		const gusting = time < gustUntil;
		const looseDamping = (gusting ? 0.96 : 0.92) ** k;
		const springDamping = 0.78 ** k;
		for (const p of particles) {
			if (p.pending && time >= p.startAt) depart(p);
			// Holders stay on their letter while they wait; new arrivals ride the wind until then
			if (p.hasTarget && (p.pending || time > p.startAt)) {
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
					p.vx += current.dx * 0.03 * k;
					p.vy += current.dy * 0.03 * k;
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

	// A loose particle that left the frame: a spare retires, anything else is shed from the name again
	function recycle(p: Particle) {
		if (p.spare) {
			p.dead = true;
		} else if (current) {
			shed(p, WEST_SHARE);
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
			ctx.beginPath();
			if (night) {
				// Stars twinkle, with the odd four-pointed spark; loose ones are the dimmer sky
				const twinkle = 0.65 + 0.35 * Math.sin(time * 2 + p.phase);
				ctx.globalAlpha = p.hasTarget ? twinkle : twinkle * 0.45;
				traceStar(ctx, p.x, p.y, p.size);
				ctx.fill();
				if (p.tone === 0 && p.phase < 0.35) drawSpark(ctx, p.x, p.y, p.size);
			} else {
				// Leaves turn in the wind
				ctx.globalAlpha = p.hasTarget ? 1 : 0.7;
				traceLeaf(ctx, p.x, p.y, p.size, p.rot);
				ctx.fill();
			}
		}
		ctx.globalAlpha = 1;
	}

	let last = 0;
	// When a frame was last drawn: a hidden or covered window stops drawing without
	// always reporting itself hidden
	let drawnAt = 0;
	function loop(now: number) {
		const dt = Math.min(0.05, last ? (now - last) / 1000 : FRAME);
		last = now;
		drawnAt = now;
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
		isActive: () => onScreen && tabVisible && !destroyed && performance.now() - drawnAt < 500,
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
