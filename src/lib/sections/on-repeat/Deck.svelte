<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import { clock, type Player } from './player.svelte.ts';

	let { player }: { player: Player } = $props();

	const shown = $derived(player.shown);
	const level = $derived(player.muted ? 0 : player.volume);
</script>

<div class="deck" class:live={player.playing}>
	<div class="art">
		{#if shown?.artwork}
			<img
				src={shown.artwork}
				alt="Cover of {shown.album ?? shown.title}"
				width="400"
				height="400"
				loading="lazy"
				decoding="async"
			/>
		{/if}
	</div>
	<div class="now">
		<p class="song storm-type">{shown?.title}</p>
		<p class="artist">{shown?.artist}</p>
	</div>

	<div class="controls">
		<button type="button" onclick={() => player.skip(-1)} aria-label="Previous song">
			<Icon name="skip-back" size={22} />
		</button>
		<button
			type="button"
			class="main"
			onclick={() => player.toggle()}
			aria-label={player.playing ? 'Pause preview' : 'Play preview'}
			disabled={!player.playable.length}
		>
			<Icon name={player.playing ? 'pause' : 'play'} size={26} />
		</button>
		<button type="button" onclick={() => player.skip(1)} aria-label="Next song">
			<Icon name="skip-forward" size={22} />
		</button>
	</div>

	<div class="progress">
		<input
			type="range"
			min="0"
			max={player.length}
			step="0.1"
			value={player.time}
			oninput={(e) => player.seek(Number(e.currentTarget.value))}
			aria-label="Seek within the preview"
			aria-valuetext="{clock(player.time)} of {clock(player.length)}"
			disabled={player.index === -1}
			style:--fill="{(player.time / player.length) * 100}%"
		/>
		<span class="tabular"
			><span class:playing={player.playing}>{player.status}</span> · {clock(player.time)}</span
		>
	</div>

	<div class="volume">
		<button
			type="button"
			onclick={() => player.toggleMute()}
			aria-label={player.muted ? 'Unmute' : 'Mute'}
			aria-pressed={player.muted}
		>
			<Icon name={player.muted ? 'volume-off' : 'volume'} />
		</button>
		{#if player.volumeSupported}
			<input
				type="range"
				min="0"
				max="1"
				step="0.05"
				value={level}
				oninput={(e) => player.setVolume(Number(e.currentTarget.value))}
				aria-label="Volume"
				aria-valuetext="{Math.round(level * 100)}%"
				style:--fill="{level * 100}%"
			/>
		{/if}
	</div>

	<p class="full">
		Full song on
		<a href={shown?.spotifyUrl}>Spotify</a>{#if shown?.appleMusicUrl}<span
				class="sep"
				aria-hidden="true">·</span
			><a href={shown.appleMusicUrl}>Apple Music</a>{/if}
	</p>
</div>

<style>
	.deck {
		position: sticky;
		top: 6rem;
		display: grid;
		gap: 1.25rem;
	}
	.art {
		aspect-ratio: 1;
		border-radius: 6px;
		overflow: hidden;
		background: var(--ground-raised);
		outline: 1px solid var(--rule);
		transition: box-shadow 0.8s var(--ease-out);
	}
	.live .art {
		box-shadow: var(--glow);
	}
	.art img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 1.2s var(--ease-out);
	}
	.live .art img {
		transform: scale(1.03);
	}
	.now p {
		margin: 0;
	}
	.song {
		font-size: clamp(2.25rem, 4vw, 3.25rem);
		overflow-wrap: anywhere;
	}
	.now .artist {
		margin-top: 0.4rem;
		color: var(--ink-soft);
	}
	.controls {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.controls button,
	.volume button {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		color: var(--ink);
		cursor: pointer;
		transition:
			background-color 0.3s var(--ease-out),
			color 0.3s var(--ease-out);
	}
	.controls button:hover,
	.volume button:hover {
		background: var(--ground-raised);
	}
	.controls .main {
		width: 60px;
		height: 60px;
		background: var(--ink);
		color: var(--ground);
	}
	.controls .main:hover {
		background: var(--flash-ink);
	}
	.live .controls .main {
		box-shadow: var(--glow);
	}
	.controls button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.progress,
	.volume {
		display: flex;
		align-items: center;
		color: var(--ink-soft);
	}
	.progress {
		gap: 1rem;
		font-family: var(--font-code);
		font-size: 0.8125rem;
	}
	.progress .playing {
		color: var(--flash-ink);
	}
	.volume {
		gap: 0.5rem;
	}
	.volume button {
		margin-left: -10px;
		color: var(--ink-soft);
	}
	.volume button:hover {
		color: var(--ink);
	}
	.volume input {
		flex: 0 1 9rem;
	}
	input[type='range'] {
		flex: 1;
		appearance: none;
		/* A full 44px touch target around the 3px track, without growing the layout */
		height: 44px;
		margin-block: -10px;
		background: transparent;
		cursor: pointer;
	}
	input[type='range']::-webkit-slider-runnable-track {
		height: 3px;
		border-radius: 3px;
		background: linear-gradient(to right, var(--flash) var(--fill), var(--rule) var(--fill));
	}
	input[type='range']::-moz-range-track {
		height: 3px;
		border-radius: 3px;
		background: linear-gradient(to right, var(--flash) var(--fill), var(--rule) var(--fill));
	}
	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		width: 14px;
		height: 14px;
		margin-top: -5.5px;
		border-radius: 50%;
		background: var(--ink);
	}
	input[type='range']::-moz-range-thumb {
		width: 14px;
		height: 14px;
		border: 0;
		border-radius: 50%;
		background: var(--ink);
	}
	input[type='range']:disabled {
		cursor: default;
		opacity: 0.5;
	}
	.full {
		margin: 0;
		font-size: 0.9375rem;
		color: var(--ink-soft);
	}
	.full a {
		color: var(--ink);
	}
	.sep {
		margin-inline: 0.4em;
	}
	@media (max-width: 52rem) {
		.deck {
			position: static;
			grid-template-columns: 7rem minmax(0, 1fr);
			column-gap: 1.25rem;
		}
		.controls,
		.progress,
		.volume,
		.full {
			grid-column: 1 / -1;
		}
		.song {
			font-size: 2rem;
		}
	}
</style>
