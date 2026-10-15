<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import type { Book } from '#lib/types/book.ts';
	import { byline, shortDate } from './format.ts';

	let { book }: { book: Book } = $props();

	const percent = $derived(
		book.progress && book.pages ? Math.min(100, (book.progress / book.pages) * 100) : null
	);
</script>

<article class="now" aria-labelledby="reading-now">
	<a class="cover" href={book.url} tabindex="-1" aria-hidden="true">
		{#if book.cover}
			<img
				src={book.cover.url}
				alt=""
				width={book.cover.width}
				height={book.cover.height}
				loading="lazy"
				decoding="async"
				style:background-color={book.cover.color}
			/>
		{/if}
	</a>
	<div class="about">
		<h3 id="reading-now" class="title storm-type"><a href={book.url}>{book.title}</a></h3>
		{#if book.authors.length}<p class="by">{byline(book.authors)}</p>{/if}

		{#if percent !== null}
			<div
				class="progress"
				role="progressbar"
				aria-label="Reading progress"
				aria-valuemin="0"
				aria-valuemax={book.pages}
				aria-valuenow={book.progress}
				aria-valuetext="Page {book.progress} of {book.pages}"
			>
				<span style:--fill="{percent}%"></span>
			</div>
		{/if}
		<p class="data tabular">
			<span class="live">Reading</span>
			{#if percent !== null}· page {book.progress} of {book.pages}{:else if book.pages}· {book.pages}
				pages{/if}
			{#if book.started}· since {shortDate(book.started)}{/if}
		</p>
		<a class="more" href={book.url}>On Hardcover <Icon name="arrow-up-right" size={16} /></a>
	</div>
</article>

<style>
	.now {
		position: sticky;
		top: calc(var(--nav-h) + 2rem);
		display: grid;
		gap: 1.25rem;
	}
	.cover {
		display: block;
		width: min(100%, 17rem);
	}
	.cover img {
		width: 100%;
		height: auto;
		border-radius: 3px 6px 6px 3px;
		outline: 1px solid var(--rule);
		/* The book being read is live, so it carries the night glow */
		box-shadow:
			var(--glow),
			0 24px 40px -24px rgb(0 0 0 / 0.45);
	}
	.title {
		margin: 0;
		font-size: clamp(2.25rem, 4vw, 3.25rem);
		overflow-wrap: anywhere;
		text-wrap: balance;
	}
	.title a {
		color: var(--ink);
		text-decoration: none;
	}
	.title a:hover {
		color: var(--flash-ink);
	}
	.about {
		display: grid;
		gap: 0.75rem;
	}
	.by {
		margin: 0;
		color: var(--ink-soft);
	}
	.progress {
		height: 3px;
		border-radius: 3px;
		background: var(--rule);
		overflow: hidden;
	}
	.progress span {
		display: block;
		width: var(--fill);
		height: 100%;
		background: var(--flash);
	}
	.data {
		margin: 0;
		font-family: var(--font-code);
		font-size: 0.8125rem;
		color: var(--ink-soft);
	}
	.live {
		color: var(--flash-ink);
	}
	.more {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		justify-self: start;
		min-height: 44px;
		font-weight: 600;
		color: var(--ink);
		text-decoration: underline;
		text-decoration-color: var(--rule);
	}
	.more:hover {
		text-decoration-color: var(--flash);
	}
	@media (max-width: 52rem) {
		.now {
			position: static;
			grid-template-columns: 7.5rem minmax(0, 1fr);
			align-items: end;
			column-gap: 1.25rem;
		}
		.title {
			font-size: 2rem;
		}
	}
</style>
