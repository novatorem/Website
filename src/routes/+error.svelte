<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { PowerGlitch } from 'powerglitch';
	onMount(async () => {
		PowerGlitch.glitch('.glitch');
	});
</script>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="glitch text-5xl font-bold">{$page.status}: {$page.error?.message}</h1>
			<p class="py-6">Not sure how you got here, but the link provided failed to load.</p>
			<a class="btn btn-info" href="/">Go home</a>
		</div>
	</div>
</div>
