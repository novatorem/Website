<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { PowerGlitch } from 'powerglitch';
	import Icon from '#lib/components/Icon.svelte';
	import { languageIcon } from '#lib/components/language-icons.ts';
	import { site } from '#lib/site.ts';
	import type { Repo } from '#lib/types/github.ts';

	// Show at least this many, then round up to whole rows of the grid
	const MIN_SHOWN = 6;

	let root: HTMLElement | undefined = $state();
	let list: HTMLUListElement | undefined = $state();
	let columns = $state(3);
	let repos: Repo[] = $state([]);

	const target = $derived(Math.ceil(MIN_SHOWN / columns) * columns);
	// Never leave a dangling partial row: drop to the last full row if repos run out
	const visible = $derived.by(() => {
		const count = Math.min(repos.length, target);
		const full = Math.floor(count / columns) * columns;
		return repos.slice(0, full || count);
	});
	let status: 'idle' | 'loading' | 'loaded' | 'error' = $state('idle');

	async function load() {
		status = 'loading';
		try {
			const res = await fetch(
				`https://api.github.com/users/${site.githubUser}/repos?sort=updated&direction=desc&per_page=100`
			);
			if (!res.ok) throw new Error(`GitHub API responded with ${res.status}`);
			const data: Repo[] = await res.json();
			repos = data
				.filter((repo) => !repo.fork)
				.sort((a, b) => b.stargazers_count - a.stargazers_count);
			status = 'loaded';
		} catch (err) {
			console.error(err);
			status = 'error';
			await tick();
			PowerGlitch.glitch('.repos-glitch', { timing: { duration: 2400, iterations: 2 } });
		}
	}

	// Fetch only when the visitor actually scrolls near the list
	onMount(() => {
		if (!root) return;
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && status === 'idle') {
					load();
					io.disconnect();
				}
			},
			{ rootMargin: '300px' }
		);
		io.observe(root);
		return () => io.disconnect();
	});

	// Count the grid's columns so the list always ends on a full row. The list is
	// re-created after an error and retry, so the observer follows the current element.
	$effect(() => {
		if (!list) return;
		const el = list;
		const ro = new ResizeObserver(() => {
			const tracks = getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean);
			columns = Math.max(1, tracks.length);
		});
		ro.observe(el);
		return () => ro.disconnect();
	});

	const format = (n: number) => new Intl.NumberFormat('en', { notation: 'compact' }).format(n);
</script>

<div class="repos" bind:this={root}>
	<div class="head">
		<h3>On GitHub</h3>
		<a href={site.githubRepos}>
			All repositories
			<Icon name="arrow-up-right" size={16} />
		</a>
	</div>

	{#if status === 'error'}
		<div class="error" role="alert">
			<p class="repos-glitch storm-type" aria-hidden="true">Lost in the wind</p>
			<p>GitHub didn't answer, so the repositories couldn't load. It may be rate-limiting.</p>
			<button type="button" onclick={load}>Try again</button>
		</div>
	{:else}
		<ul bind:this={list} aria-busy={status !== 'loaded'}>
			{#if status === 'loaded'}
				{#each visible as repo (repo.id)}
					<li>
						<a href={repo.html_url}>
							<span class="name">{repo.name}</span>
							<span class="about">{repo.description ?? 'No description yet.'}</span>
							<span class="meta tabular">
								<span title="{repo.stargazers_count} stars">
									<Icon name="star" size={14} />
									{format(repo.stargazers_count)}<span class="sr-only">stars</span>
								</span>
								<span title="{repo.forks_count} forks">
									<Icon name="fork" size={14} strokeWidth={2} />
									{format(repo.forks_count)}<span class="sr-only">forks</span>
								</span>
								{#if repo.language}
									{@const mark = languageIcon(repo.language)}
									<span>
										{#if mark}<Icon path={mark} size={13} />{:else}<Icon
												name="code"
												size={14}
												strokeWidth={2}
											/>{/if}
										{repo.language}
									</span>
								{/if}
							</span>
						</a>
					</li>
				{/each}
			{:else}
				{#each Array.from({ length: target }, (_v, i) => i) as i (i)}
					<li class="placeholder" aria-hidden="true"><span></span><span></span></li>
				{/each}
				<li class="sr-only">Loading repositories from GitHub…</li>
			{/if}
		</ul>
	{/if}
</div>

<style>
	.repos {
		margin-top: clamp(4rem, 8vw, 6rem);
	}
	.head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--rule);
	}
	h3 {
		font-size: clamp(1.5rem, 2.5vw, 2rem);
		font-weight: 700;
		font-stretch: 75%;
		margin: 0;
	}
	.head a {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		min-height: 44px;
		color: var(--ink);
		font-weight: 500;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
		column-gap: clamp(1.5rem, 3vw, 3rem);
	}
	li a {
		display: grid;
		gap: 0.35rem;
		padding: 1.25rem 0;
		border-bottom: 1px solid var(--rule);
		color: var(--ink);
		text-decoration: none;
		height: 100%;
	}
	.name {
		font-weight: 700;
		font-size: 1.125rem;
	}
	li a:hover .name {
		color: var(--flash-ink);
		text-decoration: underline;
		text-decoration-color: var(--flash);
	}
	.about {
		color: var(--ink-soft);
		font-size: 0.9375rem;
		line-height: 1.5;
	}
	.meta {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		font-family: var(--font-code);
		font-size: 0.8125rem;
		color: var(--ink-soft);
	}
	.meta > span {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}
	.meta :global(svg) {
		color: var(--ink-soft);
	}
	.placeholder {
		display: grid;
		gap: 0.6rem;
		padding: 1.4rem 0;
		border-bottom: 1px solid var(--rule);
	}
	.placeholder span {
		height: 0.9rem;
		width: 45%;
		border-radius: 2px;
		background: var(--ground-raised);
		animation: breathe 1.6s ease-in-out infinite;
	}
	.placeholder span + span {
		width: 85%;
	}
	@keyframes breathe {
		50% {
			opacity: 0.45;
		}
	}
	.error {
		padding-block: 2rem;
		display: grid;
		gap: 0.75rem;
		justify-items: start;
	}
	.repos-glitch {
		font-size: clamp(2.5rem, 6vw, 4.5rem);
		margin: 0;
		color: var(--flash-ink);
	}
	.error p {
		margin: 0;
		color: var(--ink-soft);
	}
	.error button {
		min-height: 44px;
		padding-inline: 1.25rem;
		border: 1px solid var(--ink);
		border-radius: 2px;
		font-weight: 600;
		cursor: pointer;
		color: var(--ink);
	}
	.error button:hover {
		background: var(--ink);
		color: var(--ground);
	}
</style>
