<script lang="ts">
	import type { Player } from './player.svelte.ts';

	let { player }: { player: Player } = $props();

	const number = (i: number) => String(i + 1).padStart(2, '0');
</script>

{#snippet details(title: string, artist: string)}
	<span class="t">
		<span class="title">{title}</span>
		<span class="by">{artist}</span>
	</span>
{/snippet}

<ol class="list" aria-label="Tracklist">
	{#each player.tracks as track, i (track.spotifyUrl)}
		<li class:current={i === player.index}>
			{#if track.previewUrl}
				<button
					type="button"
					onclick={() => player.play(i)}
					aria-current={i === player.index ? 'true' : undefined}
				>
					<span class="n tabular" aria-hidden="true">
						{#if i === player.index && player.playing}
							<span class="bars"><i></i><i></i><i></i></span>
						{:else}
							{number(i)}
						{/if}
					</span>
					{#if track.artworkSmall}
						<img src={track.artworkSmall} alt="" width="40" height="40" loading="lazy" />
					{:else}
						<span class="noart"></span>
					{/if}
					{@render details(track.title, track.artist)}
				</button>
			{:else}
				<a href={track.spotifyUrl}>
					<span class="n tabular" aria-hidden="true">{number(i)}</span>
					<span class="noart"></span>
					{@render details(track.title, track.artist)}
					<span class="len">Spotify</span>
				</a>
			{/if}
		</li>
	{/each}
</ol>

<style>
	.list {
		list-style: none;
		padding: 0 0.5rem 0 0;
		margin: 0;
		max-height: 40rem;
		overflow-y: auto;
		border-top: 1px solid var(--rule);
		scrollbar-width: thin;
		scrollbar-color: var(--spent) transparent;
	}
	.list button,
	.list a {
		display: grid;
		grid-template-columns: 2.25rem 40px minmax(0, 1fr) auto;
		align-items: center;
		gap: 1rem;
		width: 100%;
		min-height: 60px;
		padding: 0.6rem 0.25rem;
		border-bottom: 1px solid var(--rule);
		text-align: left;
		color: var(--ink);
		text-decoration: none;
		cursor: pointer;
		transition: background-color 0.3s var(--ease-out);
	}
	.list button:hover,
	.list a:hover {
		background: var(--ground-raised);
	}
	.list img,
	.noart {
		width: 40px;
		height: 40px;
		border-radius: 3px;
		object-fit: cover;
		background: var(--ground-raised);
	}
	.n,
	.len {
		font-family: var(--font-code);
		font-size: 0.8125rem;
		color: var(--ink-soft);
	}
	.n {
		text-align: right;
	}
	.t {
		display: grid;
		min-width: 0;
	}
	.title,
	.by {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.title {
		font-weight: 600;
	}
	.by {
		font-size: 0.875rem;
		color: var(--ink-soft);
	}
	.current .title {
		color: var(--flash-ink);
		text-shadow: var(--glow);
	}
	.bars {
		display: inline-flex;
		align-items: flex-end;
		gap: 2px;
		height: 14px;
	}
	.bars i {
		width: 3px;
		background: var(--flash);
		animation: eq 0.9s ease-in-out infinite alternate;
	}
	.bars i:nth-child(2) {
		animation-delay: -0.3s;
	}
	.bars i:nth-child(3) {
		animation-delay: -0.6s;
	}
	@keyframes eq {
		from {
			height: 3px;
		}
		to {
			height: 14px;
		}
	}
	@media (max-width: 52rem) {
		.list {
			max-height: 28rem;
		}
	}
</style>
