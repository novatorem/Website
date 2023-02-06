<script lang="ts">
	import { onMount } from 'svelte';

	onMount(async () => {
		var i = 0;
		var content = '\tdeveloper, reader, curator, techie';
		document.getElementById('typewriter')!.innerHTML = '';

		function typeWriter() {
			if (i < content.length) {
				document.getElementById('typewriter')!.innerHTML += content.charAt(i);
				i++;
				setTimeout(typeWriter, 50);
			}
		}
		typeWriter();
	});
</script>

<div class="hero min-h-screen">
	<div class="hero-content flex-col lg:flex-row max-w-[100vw]">
		<img
			src="/images/headshot.png"
			class="max-w-sm rounded-lg lg:mr-6"
			alt="Drawing of Andrew Novac's headshot"
		/>
		<div>
			<h1
				class="text-5xl font-bold bg-gradient-to-r bg-clip-text leading-normal text-transparent from-[#048eaa] via-blue-500 to-[#048eaa] animate-text text-center"
			>
				Hi, I'm Andrew!
			</h1>
			<br />
			<div class="lg:min-w-[400px] max-w-[100vw] mockup-code">
				<pre data-prefix="1"><code
						><span class="text-info">traits</span>{'[] '}<span class="text-secondary"
							>novatorem</span
						>{' ='}</code
					></pre>
				<pre data-prefix="1"><code>{'{'}</code></pre>
				<pre data-prefix="2"><code id="typewriter" class="text-success"
						>{'    Developer, Reader, Curator, Techie'}</code
					></pre>
				<pre data-prefix="3"><code>{'}'}</code></pre>
			</div>
		</div>
	</div>
</div>
