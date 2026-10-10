<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import SectionTitle from '#lib/components/SectionTitle.svelte';
	import { site } from '#lib/site.ts';
	import type { Bookshelf } from '#lib/types/book.ts';
	import BookList from './BookList.svelte';
	import ReadingNow from './ReadingNow.svelte';
	import { count } from './format.ts';

	let { shelf }: { shelf: Bookshelf | null } = $props();

	// The most recently touched book in progress leads; the rest of the shelf follows
	const current = $derived(shelf?.reading[0]);
	const alsoReading = $derived(shelf?.reading.slice(1) ?? []);
	const stats = $derived.by(() => {
		if (!shelf) return [];
		const s = shelf.stats;
		return [
			{ label: 'Books read', value: count(s.read) },
			{ label: `Finished in ${new Date().getFullYear()}`, value: count(s.readThisYear) },
			{ label: 'Pages read', value: count(s.pagesRead) },
			{ label: 'Waiting to be read', value: count(s.wantToRead) }
		];
	});
</script>

<section class="section" aria-labelledby="bookshelf">
	<SectionTitle id="bookshelf" text="Bookshelf" />

	{#if shelf}
		<div class="shelf" class:solo={!current}>
			{#if current}<ReadingNow book={current} />{/if}

			<div class="side">
				<dl class="stats">
					{#each stats as stat (stat.label)}
						<div>
							<dt>{stat.label}</dt>
							<dd class="tabular">{stat.value}</dd>
						</div>
					{/each}
				</dl>

				{#if alsoReading.length}
					<div class="group">
						<h3>Also reading</h3>
						<BookList books={alsoReading} label="Also reading" show="reading" />
					</div>
				{/if}

				<div class="group">
					<h3>Recently finished</h3>
					<BookList books={shelf.finished} label="Recently finished" show="finished" />
				</div>
			</div>
		</div>
	{:else}
		<p class="empty">
			The shelf syncs from Hardcover when the site is built; until then, it lives on Hardcover.
		</p>
	{/if}

	<p class="credit">
		Tracked on <a href={shelf?.profileUrl ?? site.hardcover}
			>Hardcover <Icon name="arrow-up-right" size={14} /></a
		>
	</p>
</section>

<style>
	.shelf {
		display: grid;
		grid-template-columns: minmax(16rem, 22rem) minmax(0, 1fr);
		gap: clamp(2rem, 4vw, 4rem);
		align-items: start;
	}
	.side {
		container-type: inline-size;
		display: grid;
		gap: clamp(2.5rem, 4vw, 3.5rem);
	}
	/* A ledger, not a dashboard: labels left, values right, ruled rows */
	.stats {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		column-gap: clamp(1.5rem, 3vw, 3rem);
		margin: 0;
		border-top: 1px solid var(--rule);
	}
	.stats div {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		padding: 0.85rem 0;
		border-bottom: 1px solid var(--rule);
	}
	dt {
		color: var(--ink-soft);
	}
	dd {
		margin: 0;
		font-weight: 700;
		font-size: 1.125rem;
		text-align: right;
	}
	h3 {
		margin: 0 0 0.75rem;
		font-size: clamp(1.5rem, 2.5vw, 2rem);
		font-weight: 700;
		font-stretch: 75%;
	}
	.empty {
		margin: 0;
		max-width: 52ch;
		font-size: 1.125rem;
		color: var(--ink-soft);
	}
	.credit {
		margin: 1.5rem 0 0;
		font-size: 0.875rem;
		color: var(--ink-soft);
	}
	.credit a {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--ink);
	}
	.shelf.solo {
		grid-template-columns: minmax(0, 1fr);
	}
	@media (max-width: 52rem) {
		.shelf {
			grid-template-columns: 1fr;
		}
	}
	/* Measured in rem against the column, so larger default text also drops to one column */
	@container (max-width: 34rem) {
		.stats {
			grid-template-columns: 1fr;
		}
	}
</style>
