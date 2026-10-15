<script lang="ts">
	import { icons, type IconName } from './icons.ts';

	type Props = {
		size?: number | string;
		strokeWidth?: number;
	} & ({ name: IconName; path?: never } | { path: string; name?: never });

	// `path` draws a single solid mark (e.g. a Simple Icons language logo)
	let { name, path, size = 20, strokeWidth = 1.75 }: Props = $props();

	const icon = $derived(name ? icons[name] : { d: [path!], filled: true });
	const filled = $derived('filled' in icon && icon.filled);
</script>

<svg
	viewBox="0 0 24 24"
	width={size}
	height={size}
	fill={filled ? 'currentColor' : 'none'}
	stroke={filled ? 'none' : 'currentColor'}
	stroke-width={filled ? undefined : strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#each icon.d as d (d)}<path {d} />{/each}
</svg>
