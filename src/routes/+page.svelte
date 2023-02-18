<script lang="ts">
	import { onMount } from 'svelte';
	import Theme from '$lib/Theme.svelte';

	onMount(async () => {
		var i = 0;
		var content = '    Developer, Reader, Curator, Techie';
        document.getElementById('typewriter').innerHTML = "";

		function typeWriter() {
			if (i < content.length) {
				document.getElementById('typewriter').innerHTML += content.charAt(i);
				i++;
				setTimeout(typeWriter, 50);
			}
		}
		typeWriter();
	});
</script>

<svelte:head>
	<title>Andrew Novac</title>
</svelte:head>

<Theme />

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content flex-col lg:flex-row">
		<img
			src="/images/headshot.png"
			class="max-w-sm rounded-lg"
			alt="Drawing of Andrew Novac's headshot"
		/>
		<div>
			<h1
				class="text-5xl font-bold bg-gradient-to-r bg-clip-text leading-normal text-transparent from-[#048eaa] via-blue-500 to-[#048eaa] animate-text ml-0 pl-0 tracking-normal"
			>
				Hi, I'm Andrew!
			</h1>
            <br/>
			<div class="min-w-[450px] mockup-code">
				<pre data-prefix="1"><code><span class="text-info">traits</span>{'[] '}<span class="text-secondary">novatorem</span>{' ='}</code></pre>
				<pre data-prefix="1"><code>{'{'}</code></pre>
				<pre data-prefix="2"><code id="typewriter" class="text-success">{'    Developer, Reader, Curator, Techie'}</code
					></pre>
				<pre data-prefix="3"><code>{'}'}</code></pre>
			</div>
		</div>
	</div>
</div>
