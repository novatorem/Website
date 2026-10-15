<script lang="ts">
	import work from '#lib/data/work.json';
	import education from '#lib/data/education.json';
	import Icon from '#lib/components/Icon.svelte';
	import SectionTitle from '#lib/components/SectionTitle.svelte';

	type Entry = (typeof work)[number];

	// The latest three show by default; the rest fold behind a summary that names them
	const SHOWN = 3;
	const groups = [
		{ label: 'Work', noun: 'role', entries: work },
		{ label: 'Education', noun: 'entry', entries: education }
	].map((group) => ({
		...group,
		// A timeline is ongoing while its newest entry runs to "now"
		ongoing: group.entries[0]?.duration.endsWith('now') ?? false
	}));
	let expanded: Record<string, boolean> = $state({});

	function summary(rest: Entry[], noun: string) {
		const places = [...new Set(rest.map((e) => e.institution))].join(', ');
		const years = rest.flatMap((e) => (e.duration.match(/\d{4}/g) ?? []).map(Number));
		const span = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : '';
		const plural = rest.length === 1 ? noun : noun === 'entry' ? 'entries' : `${noun}s`;
		return {
			lead: `${rest.length} earlier ${plural}`,
			detail: [places, span].filter(Boolean).join(' · ')
		};
	}
</script>

{#snippet item(entry: Entry)}
	<li>
		<span class="when tabular">{entry.duration}</span>
		<div class="what">
			<span class="role">{entry.role}</span>
			<span class="where">
				{#if entry.tint}
					<!-- A one-colour brand mark, painted in the brand's own day and night colours -->
					<span
						class="mark"
						style:--logo="url(/images/experience/{entry.short}.png)"
						style:--day={entry.tint.day}
						style:--night={entry.tint.night}
					></span>
				{:else}
					<img
						src="/images/experience/{entry.short}.png"
						alt=""
						width="20"
						height="20"
						loading="lazy"
					/>
				{/if}
				{entry.institution} · {entry.location}
			</span>
		</div>
	</li>
{/snippet}

<section class="section" aria-labelledby="record">
	<SectionTitle id="record" text="Record" />

	<div class="groups">
		{#each groups as group (group.label)}
			<div class="group" class:ongoing={group.ongoing}>
				<h3>{group.label}</h3>
				<ol>
					{#each group.entries.slice(0, SHOWN) as entry (entry.id)}
						{@render item(entry)}
					{/each}
				</ol>
				{#if group.entries.length > SHOWN}
					{@const rest = group.entries.slice(SHOWN)}
					{@const label = summary(rest, group.noun)}
					{@const open = !!expanded[group.label]}
					<div class="more" class:open id="more-{group.label}" inert={!open}>
						<div class="more-inner">
							<ol>
								{#each rest as entry (entry.id)}
									{@render item(entry)}
								{/each}
							</ol>
						</div>
					</div>
					<button
						type="button"
						class="toggle"
						aria-expanded={open}
						aria-controls="more-{group.label}"
						onclick={() => (expanded[group.label] = !open)}
					>
						<span class="lead">{open ? 'Show fewer' : label.lead}</span>
						{#if !open}<span class="detail">{label.detail}</span>{/if}
						<Icon name="chevron-down" size={16} />
					</button>
				{/if}
			</div>
		{/each}
	</div>
</section>

<style>
	.groups {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 26rem), 1fr));
		gap: clamp(2.5rem, 5vw, 5rem);
	}
	h3 {
		font-size: clamp(1.5rem, 2.5vw, 2rem);
		font-weight: 700;
		font-stretch: 75%;
		margin: 0 0 0.5rem;
	}
	ol {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	li {
		position: relative;
		display: grid;
		gap: 0.35rem;
		padding: 1.25rem 0 1.25rem 1.75rem;
		border-left: 1px solid var(--rule);
	}
	/* Each entry is a point the weather front passed through */
	li::before {
		content: '';
		position: absolute;
		left: -5px;
		top: 1.75rem;
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--ground);
		border: 1.5px solid var(--ink-soft);
	}
	/* Only an ongoing timeline marks its newest entry as current */
	.group.ongoing > ol > li:first-child::before {
		background: var(--flash);
		border-color: var(--flash);
		box-shadow: var(--glow);
	}
	.when {
		font-family: var(--font-code);
		font-size: 0.8125rem;
		color: var(--ink-soft);
	}
	.role {
		display: block;
		font-size: clamp(1.375rem, 2.4vw, 1.875rem);
		font-weight: 700;
		font-stretch: 85%;
		line-height: 1.15;
		text-wrap: balance;
	}
	.where {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.35rem;
		color: var(--ink-soft);
	}
	/* Folded roles open with a height reveal; the timeline line runs through them */
	.more {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.6s var(--ease-out);
	}
	.more.open {
		grid-template-rows: 1fr;
	}
	/* Room on the left so the timeline dots aren't clipped by the reveal */
	.more-inner {
		overflow: hidden;
		padding-left: 6px;
		margin-left: -6px;
	}
	.more:not(.open) li {
		opacity: 0;
	}
	.more li {
		transition: opacity 0.5s var(--ease-out) 0.1s;
	}
	/* The toggle sits on the timeline as its last node */
	.toggle {
		position: relative;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem 0.75rem;
		width: 100%;
		min-height: 44px;
		padding: 1rem 0 0.5rem 1.75rem;
		border-left: 1px dashed var(--rule);
		text-align: left;
		color: var(--ink);
		cursor: pointer;
	}
	.toggle::before {
		content: '';
		position: absolute;
		left: -5px;
		top: 1.45rem;
		width: 9px;
		height: 9px;
		border-radius: 50%;
		border: 1.5px dashed var(--ink-soft);
		background: var(--ground);
	}
	.toggle .lead {
		font-weight: 650;
		text-decoration: underline;
		text-decoration-color: var(--rule);
		text-underline-offset: 0.25em;
	}
	.toggle:hover .lead {
		text-decoration-color: var(--flash);
	}
	.toggle .detail {
		color: var(--ink-soft);
	}
	.toggle :global(svg) {
		transition: transform 0.5s var(--ease-out);
	}
	.toggle[aria-expanded='true'] :global(svg) {
		transform: rotate(180deg);
	}
	.where img,
	.mark {
		flex: none;
		width: 20px;
		height: 20px;
		object-fit: contain;
	}
	.mark {
		background: light-dark(var(--day), var(--night));
		mask: var(--logo) center / contain no-repeat;
	}
</style>
