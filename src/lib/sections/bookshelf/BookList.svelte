<script lang="ts">
	import type { Book } from '#lib/types/book.ts';
	import { byline, shortDate } from './format.ts';

	// `finished` shows when each book was finished; `reading` shows when it was started
	let { books, label, show }: { books: Book[]; label: string; show: 'finished' | 'reading' } =
		$props();
</script>

<ol class="list" aria-label={label}>
	{#each books as book (book.url)}
		{@const date = shortDate(show === 'finished' ? book.finished : book.started)}
		<li>
			<a href={book.url}>
				{#if book.cover}
					<img
						src={book.cover.thumb}
						alt=""
						width="36"
						height="54"
						loading="lazy"
						style:background-color={book.cover.color}
					/>
				{:else}
					<span class="nocover"></span>
				{/if}
				<span class="t">
					<span class="title">{book.title}</span>
					{#if book.authors.length}<span class="by">{byline(book.authors)}</span>{/if}
				</span>
				{#if date}<span class="when tabular">{show === 'reading' ? `since ${date}` : date}</span
					>{/if}
			</a>
		</li>
	{/each}
</ol>

<style>
	.list {
		list-style: none;
		padding: 0;
		margin: 0;
		border-top: 1px solid var(--rule);
	}
	a {
		display: grid;
		grid-template-columns: 36px minmax(0, 1fr) auto;
		align-items: center;
		gap: 1rem;
		min-height: 72px;
		padding: 0.6rem 0.25rem;
		border-bottom: 1px solid var(--rule);
		color: var(--ink);
		text-decoration: none;
		transition: background-color 0.3s var(--ease-out);
	}
	a:hover {
		background: var(--ground-raised);
	}
	a:hover .title {
		color: var(--flash-ink);
	}
	img,
	.nocover {
		width: 36px;
		height: 54px;
		border-radius: 2px 3px 3px 2px;
		object-fit: cover;
		background: var(--ground-raised);
		outline: 1px solid var(--rule);
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
	.when {
		font-family: var(--font-code);
		font-size: 0.8125rem;
		color: var(--ink-soft);
	}
</style>
