<script lang="ts">
	import LightToggle from './LightToggle.svelte';
	import { LOGO_POINTS } from '#lib/logo.ts';

	const links = [
		{ href: '#workbench', label: 'Workbench' },
		{ href: '#record', label: 'Record' },
		{ href: '#on-repeat', label: 'On repeat' },
		{ href: '#bookshelf', label: 'Bookshelf' }
	];
</script>

<header class="nav">
	<a class="mark" href="#top" aria-label="Andrew Novac, back to top">
		<!-- The primary logo, drawn inline so it takes the flash colours (static/favicon-*.svg match) -->
		<svg viewBox="0 0 322 322" width="32" height="32" aria-hidden="true">
			<defs>
				<linearGradient id="logo-fill" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" style:stop-color="var(--logo-top)" />
					<stop offset="1" style:stop-color="var(--flash)" />
				</linearGradient>
			</defs>
			<polygon fill="url(#logo-fill)" points={LOGO_POINTS} />
		</svg>
	</a>
	<nav aria-label="Sections">
		<ul>
			{#each links as link (link.href)}
				<li><a href={link.href}>{link.label}</a></li>
			{/each}
		</ul>
	</nav>
	<LightToggle />
</header>

<style>
	.nav {
		position: sticky;
		top: 0;
		z-index: 20;
		height: var(--nav-h);
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 1.5rem;
		padding-inline: var(--gutter);
		background: var(--ground);
		border-bottom: 1px solid var(--rule);
	}
	.mark {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		min-width: 44px;
	}
	/* The logo rests in black and white and takes its colour on hover or focus */
	.mark svg {
		width: 32px;
		height: 32px;
		filter: grayscale(1) contrast(1.1);
		transition: filter 0.4s var(--ease-out);
	}
	.mark:hover svg,
	.mark:focus-visible svg {
		filter: none;
	}
	ul {
		display: flex;
		gap: clamp(1rem, 3vw, 2.25rem);
		list-style: none;
		padding: 0;
		margin: 0;
	}
	nav a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--ink);
		text-decoration: none;
	}
	nav a:hover {
		text-decoration: underline;
		text-decoration-color: var(--flash);
	}
	@media (max-width: 40rem) {
		nav {
			display: none;
		}
		.nav {
			grid-template-columns: auto 1fr;
		}
		.nav > :global(:last-child) {
			justify-self: end;
		}
	}
</style>
