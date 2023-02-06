<script lang="ts">
	import { onMount } from 'svelte';
	onMount(async () => {
		const projects = document.getElementById('projects');
		const projectsScrollWidth = projects!.scrollWidth;

		setInterval(() => {
			if (projects!.scrollLeft !== projectsScrollWidth && !projects!.matches(':hover')) {
				projects!.scrollTo(projects!.scrollLeft + 1, 0);
			}
		}, 50);
	});

	interface Project {
		title: string;
		description: string;
		link: string;
		image: string;
	}

	const Projects: Project[] = [
		{
			title: 'Melodify',
			description:
				'Spotify interface with user stats, music videos, pane views, suggestions, and more',
			link: 'https://github.com/novatorem/Melodify',
			image: '/images/projects/melodify.png'
		},
		{
			title: 'Cover Hack',
			description: 'Create custom cover letters where users can input reactive fields',
			link: 'XXX',
			image: '/images/projects/coverhack.png'
		},
		{
			title: 'StreamWeaver',
			description:
				'A cross-platform application for virtual events and performances, transmitting data globally',
			link: 'XXX',
			image: '/images/projects/streamweaver.png'
		},
		{
			title: 'Plan',
			description: 'Turn an idea into an actual website or app, in a course-like format',
			link: 'XXX',
			image: 'https://images.unsplash.com/photo-1589586502913-822aa129d420'
		},
		{
			title: 'Robotics',
			description: 'Collision detection, integrated motion planning, dynamic tracking, and pathing',
			link: 'XXX',
			image: '/images/projects/robotics.png'
		},
		{
			title: 'Emergency Response Aid',
			description:
				'Team application designed as an intermediatory to help users seek medical attention',
			link: 'XXX',
			image: '/images/projects/era.png'
		}
	];
</script>

<a class="inline-flex items-center justify-center text-center w-full" href="#Projects">
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
		><path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8" /><path
			d="M10 19v-3.96 3.15"
		/><path d="M7 19h5" /><rect x="16" y="12" width="6" height="10" rx="2" /></svg
	>

	<h1 class="text-3xl ml-2">Projects</h1>
</a>

<div class="flex flex-wrap items-center justify-center m-2 overflow-x-hidden">
	<div
		class="container lg:max-w-screen-xl justify-center overflow-x-auto flex min-h-[600px]"
		id="projects"
	>
		{#each Projects as project, i}
			<div class="project card card-compact w-96 bg-base-100 m-6">
				<figure>
					<a href={project.link} class="max-h-[200px] min-h-[200px] min-w-full object-cover">
						<img
							class="max-h-[200px] min-h-[200px] min-w-full object-cover"
							src={project.image}
							alt="Shoes"
						/>
					</a>
				</figure>

				<div class="card-body max-h-[150px] min-h-[150px]">
					<h2 class="card-title">{project.title}</h2>
					<p class="max-h-[100px] min-h-[100px]">
						{project.description}
					</p>
					<div class="card-actions justify-end">
						<a class="btn" href={project.link}>View</a>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.container {
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		overflow: hidden;
	}
	
	.container:hover {
		overflow-x: scroll;
	}

	.container .project {
		min-width: 300px;
	}

	.project {
		max-width: 360px;
	}

	.container .project:not(:last-child) {
		margin-right: 15px;
	}
</style>
