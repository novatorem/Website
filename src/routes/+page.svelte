<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';

	import MailDialog from '#lib/components/MailDialog.svelte';
	import Nav from '#lib/components/Nav.svelte';
	import Bookshelf from '#lib/sections/bookshelf/Bookshelf.svelte';
	import Hero from '#lib/sections/Hero.svelte';
	import OnRepeat from '#lib/sections/on-repeat/OnRepeat.svelte';
	import Record from '#lib/sections/Record.svelte';
	import SayHi from '#lib/sections/SayHi.svelte';
	import Work from '#lib/sections/Work.svelte';
	import { site } from '#lib/site.ts';

	let { data } = $props();
	let mail: MailDialog | undefined = $state();
	const sayHi = () => mail?.open();
</script>

<a class="skip" href="#workbench">Skip to the work</a>
<Nav />
<main>
	<Hero />
	<Work />
	<Record />
	<OnRepeat tracks={data.tracks} />
	<Bookshelf shelf={data.bookshelf} />
</main>
<!-- The closing invitation and credits are the page's footer (contentinfo landmark) -->
<SayHi onSayHi={sayHi} />
<MailDialog bind:this={mail} />

<MetaTags
	title="Andrew Novac"
	titleTemplate="%s | The Homepage"
	description="The homepage of Andrew Novac - software developer in Toronto"
	canonical={site.url}
	openGraph={{
		url: site.url,
		title: 'Andrew Novac',
		description: 'The homepage of Andrew Novac - software developer in Toronto',
		images: [
			{
				url: `${site.url}/images/openGraph/novac-dev.jpg`,
				width: 1200,
				height: 630,
				alt: 'Andrew Novac, with the word developer formed out of drifting stars'
			}
		],
		siteName: 'novac'
	}}
	twitter={{ cardType: 'summary_large_image' }}
/>

<style>
	.skip {
		position: absolute;
		left: var(--gutter);
		top: -4rem;
		z-index: 50;
		padding: 0.75rem 1rem;
		background: var(--ink);
		color: var(--ground);
		font-weight: 600;
		border-radius: 2px;
	}
	.skip:focus {
		top: 0.75rem;
	}
</style>
