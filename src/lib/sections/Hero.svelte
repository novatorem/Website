<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { resolveColors } from '#lib/storm/glyphs.ts';
	import { paintDay, paintNight, sparkles, type Sparkle } from '#lib/storm/sky.ts';
	import { createStorm, type Storm } from '#lib/storm/storm.ts';
	import { currentLight, onLightChange, type Light } from '#lib/theme.ts';

	const traits = ['developer', 'reader', 'curator', 'techie'];
	// Characters in "developer, reader, curator, techie": the CSS typewriter's step count
	const typedLength = traits.join(', ').length;
	const ROTATE_MS = 6000;
	// A light sweeps through NOVAC, and the word changes as it reaches the trailing
	// edge, where the particles shed: one motion from the name into the weather
	const SWEEP_MS = 900;
	const SHED_AT_MS = 300;

	// Sun on the wall, the shadow's cool skylight tone, and the gold bloom at shadow edges
	const DAYLIGHT = { lit: '#fff1d6', fringe: '#f3c27a' };

	let hero: HTMLElement | undefined = $state();
	let canvas: HTMLCanvasElement | undefined = $state();
	let canopyFar: HTMLCanvasElement | undefined = $state();
	let canopyNear: HTMLCanvasElement | undefined = $state();
	let galaxy: HTMLCanvasElement | undefined = $state();
	let light: Light | undefined = $state();
	let twinkles: Sparkle[] = $state([]);
	// The first paint appears quickly; later light changes crossfade slowly
	let settled = $state(false);
	// The sky's CSS motion (twinkles, meteors, the canopy stirring) rests while the hero is
	// scrolled out of view
	let asleep = $state(false);
	// Plays once over the sky when the light changes
	let shift: '' | 'sunset' | 'sunrise' = $state('');
	// Width each sky was last painted at, so a light change only paints what's stale
	const painted: Record<Light, number> = { day: 0, night: 0 };
	let zone: HTMLDivElement | undefined = $state();
	let surname: HTMLSpanElement | undefined = $state();
	let active = $state(traits[0]);
	// Choosing a trait pins it and stops the rotation
	let pinned = $state(false);
	let announced = $state('');
	let storm: Storm | undefined;
	let reduceMotion = false;
	let sweepAnimation: Animation | undefined;
	let pending = 0;

	function sweep() {
		if (reduceMotion || !surname) return;
		sweepAnimation?.cancel();
		sweepAnimation = surname.animate(
			[{ backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0' }],
			{ duration: SWEEP_MS, easing: 'cubic-bezier(0.45, 0, 0.2, 1)' }
		);
	}

	// Restarting mid-transition re-syncs the sweep with the word that was asked for
	function transition(trait: string) {
		clearTimeout(pending);
		if (reduceMotion) return conjugate(trait);
		sweep();
		pending = window.setTimeout(() => conjugate(trait), SHED_AT_MS);
	}

	function conjugate(trait: string) {
		if (trait === active) return;
		active = trait;
		storm?.setWord(trait);
	}

	// The sky is painted once per size and light, then left still
	function paintSky() {
		if (!hero || !light) return;
		const { width, height } = hero.getBoundingClientRect();
		if (painted[light] === width) return;
		painted[light] = width;
		if (light === 'day') {
			const { '--ink-soft': shadow } = resolveColors(['--ink-soft'] as const);
			paintDay(canopyFar!, canopyNear!, width, height, { ...DAYLIGHT, shadow });
		} else {
			const c = resolveColors([
				'--particle-1',
				'--particle-2',
				'--particle-3',
				'--flash',
				'--ground'
			] as const);
			twinkles = sparkles(
				width,
				height,
				Math.round(Math.min(30, Math.max(12, (width * height) / 45_000)))
			);
			paintNight(galaxy!, width, height, {
				stars: [c['--particle-1'], c['--particle-2'], c['--particle-3']],
				nebula: c['--flash'],
				dust: c['--particle-3'],
				ground: c['--ground']
			});
		}
	}

	function choose(trait: string) {
		pinned = true;
		announced = trait;
		transition(trait);
	}

	onMount(() => {
		reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		// The loose sky keeps the same density on every screen (one per ~1,300px²):
		// about 900 on a laptop, 200 on a phone
		const area = hero!.clientWidth * hero!.clientHeight;
		const ambient = Math.round(Math.min(950, Math.max(180, area / 1300)));
		storm = createStorm(canvas!, { word: zone!, source: surname, ambient });
		storm.setWord(active);
		sweep();

		// Paint the sky once the first word is underway, then keep it in step with the light
		// and the hero's width (height changes, like a phone's toolbar, don't repaint)
		light = currentLight();
		// Its own task, right after the first frame, so start-up stays short
		let firstPaint = 0;
		const firstFrame = requestAnimationFrame(() => {
			firstPaint = window.setTimeout(() => {
				paintSky();
				window.setTimeout(() => (settled = true), 500);
			});
		});
		let shiftTimer = 0;
		const stopWatchingLight = onLightChange(() => {
			const next = currentLight();
			if (next === light) return;
			shift = next === 'night' ? 'sunset' : 'sunrise';
			light = next;
			paintSky();
			clearTimeout(shiftTimer);
			shiftTimer = window.setTimeout(() => (shift = ''), 1900);
		});
		let resizeTimer = 0;
		const resized = new ResizeObserver(() => {
			clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(paintSky, 200);
		});
		resized.observe(hero!);
		const seen = new IntersectionObserver(([entry]) => (asleep = !entry.isIntersecting));
		seen.observe(hero!);

		// The weather cycles through the traits on its own while it's on screen,
		// until the visitor picks one; reduced motion keeps the first word
		const rotation = reduceMotion
			? 0
			: window.setInterval(() => {
					if (pinned || !storm?.isActive()) return;
					transition(traits[(traits.indexOf(active) + 1) % traits.length]);
				}, ROTATE_MS);

		return () => {
			cancelAnimationFrame(firstFrame);
			clearTimeout(firstPaint);
			clearTimeout(shiftTimer);
			clearTimeout(resizeTimer);
			resized.disconnect();
			seen.disconnect();
			stopWatchingLight();
			clearInterval(rotation);
			clearTimeout(pending);
			sweepAnimation?.cancel();
			storm?.destroy();
		};
	});
</script>

<section class="hero" id="top" aria-labelledby="hero-name" bind:this={hero}>
	<!-- The sky behind the weather: window light and a branch by day, the Milky Way by night -->
	<div class="sky" class:settled class:asleep aria-hidden="true">
		<div class="day" class:on={light === 'day'}>
			<!-- Two depths of the same tree; each stirs a few pixels in the wind -->
			<canvas class="canopy far" bind:this={canopyFar}></canvas>
			<canvas class="canopy near" bind:this={canopyNear}></canvas>
		</div>
		<div class="night" class:on={light === 'night'}>
			<canvas class="galaxy" bind:this={galaxy}></canvas>
			{#each twinkles as star, i (i)}
				<span
					class="twinkle"
					class:spark={star.spark}
					style:left="{star.x}%"
					style:top="{star.y}%"
					style:--size="{star.size}px"
					style:--period="{star.period}s"
					style:--delay="{star.delay}s"
				></span>
			{/each}
			<span class="meteor one"></span>
			<span class="meteor two"></span>
		</div>
		<div class="dusk {shift}"></div>
	</div>
	<canvas class="weather" bind:this={canvas} aria-hidden="true"></canvas>
	<div class="word-zone" bind:this={zone} aria-hidden="true"></div>

	<div class="copy">
		<h1 id="hero-name" class="name storm-type">
			<span>Andrew</span>
			<span class="nova" bind:this={surname}>Novac</span>
		</h1>

		<div class="code" role="group" aria-label="Traits">
			<p><span class="kw">traits</span>[] <span class="id">novatorem</span> = &lbrace;</p>
			<p class="line">
				<span class="typed" style:--chars={typedLength}
					>{#each traits as trait, i (trait)}<button
							type="button"
							class="trait"
							class:active={active === trait}
							aria-pressed={active === trait}
							onclick={() => choose(trait)}>{trait}</button
						>{#if i < traits.length - 1}<span>,&nbsp;</span>{/if}{/each}</span
				>
			</p>
			<p>&rbrace;</p>
		</div>

		<a class="onward" href="#workbench">
			See the work
			<Icon name="arrow-down" size={18} />
		</a>
	</div>

	<p class="sr-only" aria-live="polite">
		{announced ? `The weather spells ${announced}.` : ''}
	</p>
</section>

<style>
	.hero {
		position: relative;
		min-height: calc(100svh - var(--nav-h));
		display: grid;
		align-content: center;
		padding: clamp(2rem, 6vw, 5rem) var(--gutter);
		overflow: hidden;
		isolation: isolate;
	}
	/* The sky: painted once, then only transformed (cheap on the compositor) */
	.sky {
		position: absolute;
		inset: 0;
		z-index: -2;
		overflow: hidden;
		pointer-events: none;
		/* The sky fades out before the hero ends, so the next section doesn't cut it off */
		mask-image: linear-gradient(to bottom, #000 78%, transparent);
	}
	.asleep .canopy,
	.asleep .twinkle,
	.asleep .meteor {
		animation-play-state: paused;
	}
	.day,
	.night {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 0.4s var(--ease-out);
	}
	.settled .day,
	.settled .night {
		transition-duration: 1.4s;
	}
	.day.on,
	.night.on {
		opacity: 1;
	}
	.sky canvas {
		position: absolute;
	}
	/* Day: a tree's shadow on a sunlit wall, from the upper right. The sun fades out toward
	   the copy so the name stays on a plain ground. Wind only shifts the two depths a few
	   pixels, out of step, like branches stirring; nothing stretches or tilts */
	.day {
		mask-image: linear-gradient(250deg, #000 30%, transparent 78%);
	}
	.canopy {
		inset: -12px;
		width: calc(100% + 24px);
		height: calc(100% + 24px);
		will-change: transform;
	}
	.canopy.far {
		animation: stir 11s ease-in-out infinite alternate;
	}
	.canopy.near {
		opacity: 0.16;
		animation: stir 7s -3s ease-in-out infinite alternate;
		--reach: 0.5;
	}
	@keyframes stir {
		33% {
			transform: translate(calc(var(--reach, 1) * 5px), calc(var(--reach, 1) * 2px));
		}
		66% {
			transform: translate(calc(var(--reach, 1) * -3px), calc(var(--reach, 1) * 4px));
		}
		100% {
			transform: translate(calc(var(--reach, 1) * 2px), calc(var(--reach, 1) * -2px));
		}
	}
	/* Night: the Milky Way holds still; a few of its stars twinkle */
	.galaxy {
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.twinkle {
		position: absolute;
		width: var(--size);
		height: var(--size);
		margin: calc(var(--size) / -2) 0 0 calc(var(--size) / -2);
		border-radius: 50%;
		background: #f3f0ff;
		box-shadow: 0 0 calc(var(--size) * 2) rgb(201 194 255 / 0.6);
		opacity: 0.25;
		animation: twinkle var(--period) var(--delay) ease-in-out infinite;
	}
	/* A four-pointed spark: two thin rays through the star */
	.twinkle.spark::before,
	.twinkle.spark::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		width: calc(var(--size) * 5);
		height: 1px;
		translate: -50% -50%;
		background: linear-gradient(90deg, transparent, rgb(243 240 255 / 0.85), transparent);
	}
	.twinkle.spark::after {
		rotate: 90deg;
	}
	@keyframes twinkle {
		50% {
			opacity: 1;
			transform: scale(1.25);
		}
	}
	/* Now and then a shooting star; the two never line up */
	.meteor {
		position: absolute;
		width: 130px;
		height: 1px;
		background: linear-gradient(90deg, rgb(243 240 255 / 0.9), transparent);
		opacity: 0;
		transform-origin: 0 50%;
	}
	.meteor.one {
		top: 14%;
		left: 72%;
		animation: meteor 17s 4s linear infinite;
	}
	.meteor.two {
		top: 34%;
		left: 90%;
		animation: meteor 29s 13s linear infinite;
	}
	@keyframes meteor {
		0% {
			opacity: 0;
			transform: rotate(152deg) translateX(0);
		}
		0.6% {
			opacity: 1;
		}
		3.5%,
		100% {
			opacity: 0;
			transform: rotate(152deg) translateX(-320px);
		}
	}
	/* Changing the light plays a sunset or sunrise over the sky (after sunlit) */
	.dusk {
		position: absolute;
		inset: 0;
		opacity: 0;
	}
	/* A sky gradient fades in and out; only opacity animates */
	.dusk.sunset {
		background: linear-gradient(to top, #f6b26b, #d9708a 40%, #2a2350 85%);
		animation: dusk 1.8s ease-out;
	}
	.dusk.sunrise {
		background: linear-gradient(to top, #ffe2b0, #9fb3bf 45%, #16132b 90%);
		animation: dusk 1.6s ease-out;
	}
	@keyframes dusk {
		30% {
			opacity: 0.32;
		}
	}
	.weather {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
	}
	.word-zone {
		position: absolute;
		right: var(--gutter);
		bottom: clamp(2rem, 7vh, 5rem);
		width: min(58vw, 60rem);
		height: clamp(7rem, 26vh, 16rem);
		pointer-events: none;
	}
	.copy {
		max-width: 46rem;
		display: grid;
		gap: clamp(1.25rem, 2.5vw, 2rem);
	}
	.name {
		/* Sized to the viewport so the name never overflows, even with large default text */
		font-size: min(24vw, 12.5rem);
		display: grid;
		margin: 0;
	}
	.nova {
		/* Hug the letters: the storm bursts from and sheds off this box */
		justify-self: start;
		background: linear-gradient(100deg, var(--ink) 0 38%, var(--flash) 48%, var(--ink) 58% 100%);
		background-size: 300% 100%;
		background-clip: text;
		-webkit-background-clip: text;
		/* At rest the flash waits off the right edge; sweep() pulls it through */
		background-position: 100% 0;
		color: transparent;
		filter: drop-shadow(var(--glow));
	}
	.code {
		font-family: var(--font-code);
		/* The traits line never wraps (it is typed out), so it shrinks to fit narrow phones */
		font-size: clamp(0.75rem, 3.6vw, 0.9375rem);
		line-height: 1.75;
		color: var(--ink-soft);
		padding-left: 1rem;
		border-left: 1px solid var(--rule);
	}
	.code p {
		margin: 0;
	}
	.line {
		padding-left: 2ch;
		min-height: 1.75em;
	}
	.kw {
		color: var(--flash-ink);
	}
	.id {
		color: var(--ink);
		font-weight: 600;
	}
	.trait {
		font: inherit;
		color: var(--ink);
		cursor: pointer;
		padding: 0.15em 0.1em;
		margin: -0.15em -0.1em;
		border-radius: 2px;
		text-decoration: underline;
		text-decoration-color: var(--rule);
		text-underline-offset: 0.3em;
		transition:
			color 0.3s var(--ease-out),
			text-decoration-color 0.3s var(--ease-out);
	}
	.trait:hover {
		text-decoration-color: var(--flash);
	}
	.trait.active {
		color: var(--flash-ink);
		text-decoration-color: var(--flash);
		text-shadow: var(--glow);
	}
	/* Typewriter: the full text is in the HTML; CSS reveals it one character at a time */
	.typed {
		--caret: 0.55em;
		/* Room inside the clip so the trait buttons' focus rings aren't cut off */
		--ring: 6px;
		display: inline-block;
		padding: var(--ring);
		margin: calc(-1 * var(--ring));
		max-width: calc(var(--chars) * 1ch + var(--caret) + 2 * var(--ring));
		overflow: hidden;
		white-space: nowrap;
		vertical-align: bottom;
		border-right: var(--caret) solid transparent;
		animation:
			type 1.7s steps(var(--chars), end) both,
			caret 0.5s steps(1) 4 both;
	}
	@keyframes type {
		from {
			max-width: calc(2 * var(--ring));
		}
	}
	@keyframes caret {
		50% {
			border-right-color: var(--ink);
		}
	}
	.onward {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		justify-self: start;
		min-height: 44px;
		font-weight: 600;
		color: var(--ink);
		text-decoration: underline;
		text-decoration-color: var(--flash);
	}
	.onward :global(svg) {
		transition: transform 0.4s var(--ease-out);
	}
	.onward:hover :global(svg) {
		transform: translateY(3px);
	}
	@media (max-width: 48rem) {
		.hero {
			min-height: auto;
			align-content: start;
		}
		.copy {
			grid-row: 1;
		}
		/* On phones the word condenses right under the traits, in the page flow */
		.word-zone {
			position: relative;
			grid-row: 2;
			inset: auto;
			width: 100%;
			height: clamp(5.5rem, 26vw, 8rem);
			margin-top: 2.5rem;
		}
	}
	@media (max-width: 26rem) {
		.line {
			padding-left: 1ch;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.nova {
			background-position: 50% 0;
		}
		.canopy,
		.twinkle,
		.meteor,
		.dusk {
			animation: none;
		}
	}
</style>
