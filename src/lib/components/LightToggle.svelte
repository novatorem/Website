<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from './Icon.svelte';
	import { currentLight, onLightChange, setLight, type Light } from '#lib/theme.ts';

	// Unknown until mounted: the prerendered page can't know the visitor's light,
	// so the visible state below is driven by CSS and aria-pressed waits for JS
	let light: Light | null = $state(null);

	onMount(() => {
		light = currentLight();
		return onLightChange(() => (light = currentLight()));
	});

	function toggle() {
		setLight(currentLight() === 'night' ? 'day' : 'night');
	}
</script>

<button
	class="toggle"
	type="button"
	onclick={toggle}
	aria-label="Starlight"
	aria-pressed={light ? light === 'night' : undefined}
>
	<span class="state day"><Icon name="sun" /><span class="max-[30rem]:sr-only">Daylight</span></span
	>
	<span class="state night"
		><Icon name="moon" /><span class="max-[30rem]:sr-only">Starlight</span></span
	>
</button>

<style>
	.toggle {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		min-width: 44px;
		justify-content: center;
		padding-inline: 0.25rem;
		font-size: 0.875rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		color: var(--ink);
		cursor: pointer;
	}
	.state {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}
	/* Show the state for whichever light is active, before and after hydration */
	.night {
		display: none;
	}
	@media (prefers-color-scheme: dark) {
		:global(:root:not([data-theme='day'])) .day {
			display: none;
		}
		:global(:root:not([data-theme='day'])) .night {
			display: inline-flex;
		}
	}
	:global(:root[data-theme='night']) .day {
		display: none;
	}
	:global(:root[data-theme='night']) .night {
		display: inline-flex;
	}
	.toggle :global(svg) {
		transition: transform 0.6s var(--ease-out);
	}
	.toggle:hover :global(svg) {
		transform: rotate(-20deg) scale(1.08);
	}
	.toggle:hover {
		color: var(--flash-ink);
	}
</style>
