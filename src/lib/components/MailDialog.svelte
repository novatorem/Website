<script lang="ts">
	import Icon from './Icon.svelte';
	import { site } from '#lib/site.ts';

	let dialog: HTMLDialogElement | undefined = $state();
	let loaded = $state(false);

	export function open() {
		loaded = true;
		dialog?.showModal();
	}

	function closeOnBackdrop(event: MouseEvent) {
		if (event.target === dialog) dialog?.close();
	}
</script>

<dialog bind:this={dialog} aria-labelledby="mail-title" onclick={closeOnBackdrop}>
	<div class="frame">
		<header>
			<h2 id="mail-title">Write to Andrew</h2>
			<button type="button" class="close" onclick={() => dialog?.close()} aria-label="Close">
				<Icon name="close" />
			</button>
		</header>
		{#if loaded}
			<iframe src={site.mailForm} title="Contact form" allow="clipboard-write"></iframe>
		{/if}
		<p class="alt">
			Prefer elsewhere? Find Andrew on
			<a href={site.linkedin}>LinkedIn</a> or
			<a href={site.github}>GitHub</a>.
		</p>
	</div>
</dialog>

<style>
	dialog {
		width: min(36rem, calc(100vw - 2rem));
		max-height: calc(100svh - 2rem);
		padding: 0;
		border: 1px solid var(--rule);
		border-radius: 8px;
		background: var(--ground);
		color: var(--ink);
		box-shadow: 0 30px 80px -30px rgb(0 0 0 / 0.5);
	}
	dialog::backdrop {
		background: rgb(11 10 26 / 0.55);
	}
	dialog[open] {
		animation: arrive 0.45s var(--ease-out);
	}
	@keyframes arrive {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
	}
	.frame {
		display: grid;
		gap: 1rem;
		padding: 1.25rem 1.25rem 1.5rem;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	h2 {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 800;
		font-stretch: 70%;
		text-transform: uppercase;
	}
	.close {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		cursor: pointer;
		color: var(--ink);
	}
	.close:hover {
		background: var(--ground-raised);
	}
	iframe {
		width: 100%;
		height: min(500px, 60svh);
		border: 0;
		border-radius: 6px;
		background: var(--ground-raised);
	}
	.alt {
		margin: 0;
		font-size: 0.9375rem;
		color: var(--ink-soft);
	}
	.alt a {
		color: var(--ink);
	}
</style>
