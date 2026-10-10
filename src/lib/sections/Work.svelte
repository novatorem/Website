<script lang="ts">
	import projects from '#lib/data/projects.json';
	import Icon from '#lib/components/Icon.svelte';
	import SectionTitle from '#lib/components/SectionTitle.svelte';
	import Repos from './Repos.svelte';

	type Project = (typeof projects)[number] & { focus?: string };

	// The screenshot beside the list follows whichever project is hovered or focused
	let current = $state(0);
	const host = (url: string) => new URL(url).hostname.replace(/^www\./, '');
</script>

{#snippet shot(project: Project, className: string, shown = true)}
	<img
		class="shot {className}"
		class:shown
		src={project.image}
		alt=""
		width={project.width}
		height={project.height}
		style:object-position={project.focus}
		loading="lazy"
		decoding="async"
	/>
{/snippet}

<section class="section" aria-labelledby="workbench">
	<SectionTitle id="workbench" text="Workbench" />

	<div class="layout">
		<ol class="projects">
			{#each projects as project, i (project.title)}
				<li>
					<a
						class="project"
						class:current={current === i}
						href={project.link}
						onmouseenter={() => (current = i)}
						onfocus={() => (current = i)}
					>
						<span class="title storm-type">{project.title}</span>
						<span class="desc">{project.description}</span>
						<span class="host">
							{host(project.link)}
							<Icon name="arrow-up-right" size={16} />
						</span>
						{@render shot(project, 'thumb')}
					</a>
				</li>
			{/each}
		</ol>

		<figure class="preview" aria-hidden="true">
			{#each projects as project, i (project.title)}
				{@render shot(project, 'frame', current === i)}
			{/each}
			<figcaption>{projects[current].title}, screenshot</figcaption>
		</figure>
	</div>

	<Repos />
</section>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
		gap: clamp(2rem, 5vw, 5rem);
		align-items: start;
	}
	.projects {
		list-style: none;
		padding: 0;
		margin: 0;
		border-top: 1px solid var(--rule);
	}
	.project {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0.25rem 1.5rem;
		padding: 1.25rem 0 1.5rem;
		border-bottom: 1px solid var(--rule);
		color: var(--ink);
		text-decoration: none;
	}
	.title {
		grid-column: 1;
		font-size: clamp(2.5rem, 5.5vw, 4.5rem);
		transition:
			font-stretch 0.7s var(--ease-out),
			color 0.4s var(--ease-out);
	}
	.desc {
		grid-column: 1;
		max-width: 52ch;
		color: var(--ink-soft);
	}
	.host {
		grid-column: 2;
		grid-row: 1 / span 2;
		align-self: start;
		margin-top: 0.75rem;
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-family: var(--font-code);
		font-size: 0.8125rem;
		color: var(--ink-soft);
	}
	.project:hover .title,
	.project:focus-visible .title,
	.project.current .title {
		font-stretch: 80%;
		color: var(--flash-ink);
	}
	.project:hover .host :global(svg) {
		transform: translate(2px, -2px);
	}
	.host :global(svg) {
		transition: transform 0.4s var(--ease-out);
	}
	.thumb {
		display: none;
	}
	.preview {
		position: sticky;
		top: 6rem;
		margin: 0;
		display: grid;
	}
	/* One 16:9 frame for every screenshot; wide ones can set a crop anchor in projects.json */
	.shot {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		object-position: top center;
		border-radius: 6px;
		outline: 1px solid var(--rule);
	}
	.frame {
		grid-area: 1 / 1;
		opacity: 0;
		filter: saturate(0.6) blur(6px);
		transform: scale(1.02);
		transition:
			opacity 0.5s var(--ease-out),
			filter 0.6s var(--ease-out),
			transform 0.6s var(--ease-out);
	}
	.frame.shown {
		opacity: 1;
		filter: none;
		transform: none;
	}
	figcaption {
		margin-top: 0.75rem;
		font-size: 0.875rem;
		color: var(--ink-soft);
	}
	@media (max-width: 56rem) {
		.layout {
			grid-template-columns: 1fr;
		}
		.project {
			grid-template-columns: minmax(0, 1fr);
		}
		.host {
			grid-column: 1;
			grid-row: auto;
			margin-top: 0.25rem;
		}
		.preview {
			display: none;
		}
		.thumb {
			display: block;
			grid-column: 1 / -1;
			margin-top: 1rem;
		}
	}
</style>
