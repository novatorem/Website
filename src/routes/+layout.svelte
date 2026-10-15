<script lang="ts">
	import '@fontsource-variable/archivo/wdth.css';
	import '../app.css';
	import { onLightChange, paintTabIcon } from '#lib/theme.ts';

	let { children } = $props();

	$effect(() => onLightChange(paintTabIcon));
</script>

{@render children()}

<svelte:head>
	<script
		async
		data-website-id="0f36cb80-5c9a-4cfa-8e70-4f894ba8da99"
		src="https://anaster.novac.dev/anaster.js"
	></script>
</svelte:head>
