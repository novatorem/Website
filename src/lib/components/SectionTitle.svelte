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
		// Loose letters are about twice as wide; on a narrow screen they only stretch as far
		// as the line allows, so the heading never wraps while it condenses. Measured once
		// the display face has loaded (the fallback face condenses differently), and again
		// on resize; until then the heading waits loose but unstretched.
		const fit = () => {
			if (gust !== 'loose') return;
			el!.style.transition = 'none';
			el!.dataset.gust = 'tight';
			const range = document.createRange();
			range.selectNodeContents(el!);
			const room = el!.clientWidth / range.getBoundingClientRect().width;
			el!.dataset.gust = 'loose';
			el!.style.transition = '';
			const stretch = Math.min(1, Math.max(0, (room * 0.9 - 1) / (125 / 62 - 1)));
			el!.style.setProperty('--loose-stretch', `${62 + (125 - 62) * stretch}%`);
			el!.style.setProperty('--loose-tracking', `${0.06 * stretch}em`);
		};
		el.style.setProperty('--loose-stretch', '62%');
		el.style.setProperty('--loose-tracking', '0em');
		gust = 'loose';
		document.fonts.ready.then(fit);
		window.addEventListener('resize', fit);
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
		return () => {
			io.disconnect();
			window.removeEventListener('resize', fit);
		};
	});
</script>

<h2 {id} class="section-title storm-type gust" data-gust={gust} bind:this={el}>{text}</h2>
