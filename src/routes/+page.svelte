<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';

	import Theme from '$lib/Theme.svelte';
	import Hero from '$lib/Home/Hero.svelte';
	import Projects from '$lib/Home/Projects.svelte';
	import Experience from '$lib/Home/Experience.svelte';
	import Activity from '$lib/Home/Activity.svelte';
	import About from '$lib/Home/About.svelte';
	import Footer from '$lib/Footer.svelte';

	function smoothlyScrollUp() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<title>Andrew Novac</title>
</svelte:head>

<div class="h-0 m-0">
	<button on:click={smoothlyScrollUp}>
		<img
			width="42"
			height="42"
			src="favicon.png"
			alt="Website logo"
			class="logo z-10 cursor-pointer h-8 w-8 fixed top-5 left-6 grayscale"
		/>
	</button>
</div>

<Theme />
<Hero />
<div class="divider" />
<Projects />
<div class="divider" />
<Experience />
<div class="divider" />
<Activity />
<div class="divider" />
<About />
<Footer />

<MetaTags
	title="Andrew Novac"
	titleTemplate="%s | The Homepage"
	description="The homepage of Andrew Novac - software developer in Toronto"
	canonical="https://novac.dev"
	openGraph={{
		url: 'https://novac.dev',
		title: 'Andrew Novac',
		description: 'The homepage of Andrew Novac - software developer in Toronto',
		images: [
			{
				url: '/images/openGraph/image-01.webp',
				width: 800,
				height: 600,
				alt: 'Website preview'
			},
			{
				url: '/images/openGraph/image-02.webp',
				width: 900,
				height: 800,
				alt: 'Website preview'
			},
			{ url: '/images/openGraph/image-03.webp' }
		],
		siteName: 'novac'
	}}
/>

<style>
	.logo:hover {
		filter: grayscale(0%);
	}
</style>
