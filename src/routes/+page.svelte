<script lang="ts">
	import Theme from '$lib/Theme.svelte';
	import Footer from '$lib/Footer.svelte';
	import Hero from '$lib/Home/Hero.svelte';
	import Projects from '$lib/Home/Projects.svelte';
	import Experience from '$lib/Home/Experience.svelte';
	import Activity from '$lib/Home/Activity.svelte';
	import About from '$lib/Home/About.svelte';
</script>

<svelte:head>
	<title>Andrew Novac</title>
</svelte:head>

<div class="h-0 m-0">
	<a href="#">
		<img
			width="42"
			height="42"
			src="favicon.png"
			alt="Website logo"
			class="logo z-10 cursor-pointer h-6 w-6 fixed top-5 left-6 grayscale"
		/>
	</a>
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

<style>
	.logo:hover {
		filter: grayscale(0%);
	}
</style>
