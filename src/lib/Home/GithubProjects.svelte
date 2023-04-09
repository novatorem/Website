<script lang="ts">
	import { onMount } from 'svelte';
	import { PowerGlitch } from 'powerglitch';
	import type { Repo } from '$lib/Models/github.type.svelte';

	let repos: Repo[] = [];

	async function loadData() {
		repos = await fetch(
			'https://api.github.com/users/novatorem/repos?sort=updated&direction=desc&per_page=100'
		).then((r) => r.json());
		repos.sort((a, b) => b.stargazers_count - a.stargazers_count).filter((repo) => !repo.fork);
	}

	onMount(async () => {
		PowerGlitch.glitch('.glitch');
		await loadData();
	});
</script>

<label for="projectsModal" class="btn btn-sm btn-circle sticky right-2 top-2 z-10">✕</label>
<div class="flex flex-wrap items-center justify-center m-6 max-w-screen-xl mx-auto gap-6">
	{#each repos as repo}
		<a href={repo.html_url} class="card w-96 bg-base-200 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">
					{repo.name}
				</h2>
				<p>{repo.description ?? 'No description provided.'}</p>
				<div class="card-actions justify-center pt-6">
					<div class="stats shadow">
						<div class="stat bg-base-300">
							<div class="stat-figure text-info">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><polygon
										points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
									/></svg
								>
							</div>
							<div class="stat-title">{repo.stargazers_count}</div>
							<div class="stat-desc">Stars</div>
						</div>

						<div class="stat bg-base-300">
							<div class="stat-figure text-info">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><circle cx="12" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><circle
										cx="18"
										cy="6"
										r="3"
									/><path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9" /><path d="M12 12v3" /></svg
								>
							</div>
							<div class="stat-title">{repo.forks_count}</div>
							<div class="stat-desc">Forks</div>
						</div>
					</div>
				</div>
			</div>
		</a>
	{:else}
		<div class="hero-content text-center">
			<div class="max-w-md">
				<h1 class="glitch text-5xl font-bold">Ooops!</h1>
				<div>Looks like there's nothing here.</div>
				<btn class="btn btn-info" on:click={loadData}>Retry</btn>
			</div>
		</div>
	{/each}
</div>
