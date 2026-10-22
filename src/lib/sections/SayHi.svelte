<script lang="ts">
	import { asset } from '#lib/assets.ts';
	import Icon from '#lib/components/Icon.svelte';
	import { site } from '#lib/site.ts';

	let { onSayHi }: { onSayHi: () => void } = $props();
</script>

<footer class="hi" aria-labelledby="say-hi">
	<h2 id="say-hi" class="sr-only">Say hi</h2>
	<div class="stage">
		<button type="button" class="big storm-type" onclick={onSayHi}>
			Say hi
			<Icon name="arrow-up-right" size="0.32em" strokeWidth={1.5} />
		</button>

		<!-- The portrait stands beside the ways to reach Andrew, on the headline's baseline -->
		<div class="contact">
			<img
				class="avatar"
				src={asset('/images/avatar.png')}
				alt="Illustrated portrait of Andrew Novac"
				width="99"
				height="132"
				loading="lazy"
			/>
			<ul class="links">
				<li>
					<button type="button" onclick={onSayHi}>
						<Icon name="mail" size={20} />
						Email
					</button>
				</li>
				<li>
					<a href={site.github}>
						<Icon name="github" size={20} />
						GitHub
					</a>
				</li>
				<li>
					<a href={site.linkedin}>
						<Icon name="linkedin" size={20} />
						LinkedIn
					</a>
				</li>
			</ul>
		</div>
	</div>

	<p class="credits">
		<span
			>Built with <a href="https://svelte.dev/docs/kit">SvelteKit</a> and
			<a href="https://tailwindcss.com/">Tailwind CSS</a></span
		>
		<span>Set in <a href="https://fonts.google.com/specimen/Archivo">Archivo</a></span>
		<span
			>Icons from <a href="https://lucide.dev/">Lucide</a> and
			<a href="https://simpleicons.org/">Simple Icons</a></span
		>
		<span
			>Previews from the
			<a href="https://performance-partners.apple.com/search-api">iTunes Search API</a></span
		>
		<a href={site.source}>Source on GitHub</a>
	</p>
</footer>

<style>
	.hi {
		padding: clamp(4rem, 10vw, 8rem) var(--gutter) 1.5rem;
		border-top: 1px solid var(--rule);
	}
	/* Headline, then the contact block right after it: one unit on one baseline */
	.stage {
		display: grid;
		grid-template-columns: auto auto;
		justify-content: start;
		align-items: end;
		gap: clamp(2.5rem, 6vw, 6rem);
		padding-bottom: clamp(2.5rem, 5vw, 4rem);
	}
	.big {
		display: inline-flex;
		align-items: flex-start;
		gap: 0.06em;
		justify-self: start;
		font-size: clamp(5rem, 20vw, 17rem);
		color: var(--ink);
		cursor: pointer;
		transition:
			font-stretch 0.9s var(--ease-out),
			color 0.5s var(--ease-out);
	}
	/* The arrow rides at cap height, like a link-out mark */
	.big :global(svg) {
		margin-top: 0.02em;
		transition: transform 0.6s var(--ease-out);
	}
	.big:hover,
	.big:focus-visible {
		font-stretch: 80%;
		color: var(--flash-ink);
		text-shadow: var(--glow);
	}
	.big:hover :global(svg) {
		transform: translate(0.05em, -0.05em);
	}
	.contact {
		display: flex;
		align-items: flex-end;
		gap: 1.25rem;
	}
	.avatar {
		flex: none;
		width: 99px;
		height: 132px;
		object-fit: contain;
		object-position: bottom;
	}
	.links {
		display: grid;
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.links a,
	.links button {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		min-height: 44px;
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--ink);
		text-decoration: underline;
		text-decoration-color: var(--rule);
		text-underline-offset: 0.3em;
		cursor: pointer;
	}
	.links a:hover,
	.links button:hover {
		color: var(--flash-ink);
		text-decoration-color: var(--flash);
	}
	.credits {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1.5rem;
		margin: 0;
		padding-top: 1rem;
		border-top: 1px solid var(--rule);
		font-size: 0.8125rem;
		color: var(--ink-soft);
	}
	.credits a {
		color: var(--ink);
	}
	/* "Source on GitHub" closes the line on the right when there's room */
	.credits > a:last-child {
		margin-left: auto;
	}
	@media (max-width: 48rem) {
		.stage {
			grid-template-columns: 1fr;
			gap: 2rem;
		}
		.avatar {
			width: 72px;
			height: 96px;
		}
		.links a,
		.links button {
			font-size: 1rem;
		}
		.credits > a:last-child {
			margin-left: 0;
		}
	}
</style>
