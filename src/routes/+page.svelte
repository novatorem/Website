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
