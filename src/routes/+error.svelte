<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { PowerGlitch } from 'powerglitch';
	import LightToggle from '#lib/components/LightToggle.svelte';
	import { createStorm } from '#lib/storm/storm.ts';

	let canvas: HTMLCanvasElement | undefined = $state();
	let zone: HTMLDivElement | undefined = $state();

	onMount(() => {
		PowerGlitch.glitch('.glitch', { timing: { duration: 2600, iterations: 3 } });
		const storm = createStorm(canvas!, { word: zone!, ambient: 220 });
		storm.setWord('Lost');
		return () => storm.destroy();
	});
</script>

<svelte:head>
	<title>{page.status} | Andrew Novac</title>
</svelte:head>

<main class="lost">
	<canvas bind:this={canvas} aria-hidden="true"></canvas>
	<div class="zone" bind:this={zone} aria-hidden="true"></div>
	<div class="top"><LightToggle /></div>
	<div class="copy">
		<h1 class="glitch storm-type">{page.status}</h1>
		<p class="what">
			{page.status === 404 ? 'This page blew away, or it never grew here.' : page.error?.message}
		</p>
		<a class="home" href={resolve('/')}>Back to the homepage</a>
	</div>
</main>

<style>
	.lost {
		position: relative;
		min-height: 100svh;
		display: grid;
		align-content: center;
		padding: var(--gutter);
		overflow: hidden;
		isolation: isolate;
	}
	canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
	}
	.zone {
		position: absolute;
		right: var(--gutter);
		bottom: 8vh;
		width: min(60vw, 52rem);
		height: 30vh;
	}
	.top {
		position: absolute;
		top: 0.5rem;
		right: var(--gutter);
	}
	.copy {
		display: grid;
		gap: 1.25rem;
		justify-items: start;
	}
	h1 {
		margin: 0;
		font-size: clamp(7rem, 24vw, 18rem);
	}
	.what {
		margin: 0;
		font-size: clamp(1.125rem, 2vw, 1.5rem);
		color: var(--ink-soft);
		max-width: 32ch;
	}
	.home {
		display: inline-flex;
		align-items: center;
		min-height: 48px;
		padding-inline: 1.25rem;
		border: 1px solid var(--ink);
		border-radius: 2px;
		color: var(--ink);
		font-weight: 600;
		text-decoration: none;
		transition:
			background-color 0.3s var(--ease-out),
			color 0.3s var(--ease-out);
	}
	.home:hover {
		background: var(--ink);
		color: var(--ground);
	}
</style>
