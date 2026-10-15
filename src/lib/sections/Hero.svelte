<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { createStorm, type Storm } from '#lib/storm/storm.ts';

	const traits = ['developer', 'reader', 'curator', 'techie'];
	// Characters in "developer, reader, curator, techie": the CSS typewriter's step count
	const typedLength = traits.join(', ').length;
	const ROTATE_MS = 6000;
	// A light sweeps through NOVAC, and the word changes as it reaches the trailing
	// edge, where the particles shed: one motion from the name into the weather
	const SWEEP_MS = 900;
	const SHED_AT_MS = 300;

	let canvas: HTMLCanvasElement | undefined = $state();
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

	function choose(trait: string) {
		pinned = true;
		announced = trait;
		transition(trait);
	}

	onMount(() => {
		reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		storm = createStorm(canvas!, { word: zone!, source: surname, ambient: 320 });
		storm.setWord(active);
		sweep();

		// The weather cycles through the traits on its own while it's on screen,
		// until the visitor picks one; reduced motion keeps the first word
		const rotation = reduceMotion
			? 0
			: window.setInterval(() => {
					if (pinned || !storm?.isActive()) return;
					transition(traits[(traits.indexOf(active) + 1) % traits.length]);
				}, ROTATE_MS);

		return () => {
			clearInterval(rotation);
			clearTimeout(pending);
			sweepAnimation?.cancel();
			storm?.destroy();
		};
	});
</script>

<section class="hero" id="top" aria-labelledby="hero-name">
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
	}
</style>
