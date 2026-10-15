<script lang="ts">
	import { onMount } from 'svelte';
	import SectionTitle from '#lib/components/SectionTitle.svelte';
	import { site } from '#lib/site.ts';
	import type { Track } from '#lib/types/track.ts';
	import Deck from './Deck.svelte';
	import Tracklist from './Tracklist.svelte';
	import { Player } from './player.svelte.ts';

	let { tracks }: { tracks: Track[] } = $props();

	// The tracklist is fixed at build time, so the player is created once
	// svelte-ignore state_referenced_locally
	const player = new Player(tracks);
	let audio: HTMLAudioElement | undefined = $state();

	onMount(() => player.attach(audio!));
</script>

<section class="section" aria-labelledby="on-repeat">
	<SectionTitle id="on-repeat" text="On repeat" />

	<div class="player">
		<Deck {player} />
		<Tracklist {player} />
	</div>

	<p class="credit">
		30-second previews courtesy of Apple Music.
		<a href={site.playlist}>Open the whole playlist on Spotify</a>
	</p>

	<audio bind:this={audio} preload="none"></audio>
</section>

<style>
	.player {
		display: grid;
		grid-template-columns: minmax(18rem, 26rem) minmax(0, 1fr);
		gap: clamp(2rem, 4vw, 4rem);
		align-items: start;
	}
	.credit {
		margin: 1.5rem 0 0;
		font-size: 0.875rem;
		color: var(--ink-soft);
	}
	.credit a {
		color: var(--ink);
	}
	@media (max-width: 52rem) {
		.player {
			grid-template-columns: 1fr;
		}
	}
</style>
