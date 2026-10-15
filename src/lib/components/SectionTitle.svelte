<script lang="ts">
	import { onMount } from 'svelte';

	let { id, text }: { id: string; text: string } = $props();

	let el: HTMLHeadingElement | undefined = $state();
	let gust: 'loose' | 'tight' = $state('tight');

	// Letters arrive loose on the wind and condense once the heading is in view.
	// The heading is fully readable at every step; only its width changes.
	onMount(() => {
		if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		if (el.getBoundingClientRect().top < window.innerHeight) return;
		gust = 'loose';
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					gust = 'tight';
					io.disconnect();
				}
			},
			{ rootMargin: '0px 0px -20% 0px' }
		);
		io.observe(el);
		return () => io.disconnect();
	});
</script>

<h2 {id} class="section-title storm-type gust" data-gust={gust} bind:this={el}>{text}</h2>
