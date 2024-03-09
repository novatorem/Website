<script lang="ts">
	import { onMount } from 'svelte';
	import { register } from 'swiper/element/bundle';
	import projects from '../Data/projects.json?raw';
	import GithubProjects from './GithubProjects.svelte';

	interface Project {
		link: string;
		title: string;
		image: string;
		diffusion: string;
		description: string;
	}
	let Projects: Project[] = JSON.parse(projects);

	async function diffuse(project: Project) {
		var element: HTMLImageElement;
		element = document.getElementById(project.title)! as HTMLImageElement;
		element.src = project.diffusion;
	}

	async function reveal(project: Project) {
		var element: HTMLImageElement;
		element = document.getElementById(project.title)! as HTMLImageElement;
		element.src = project.image;
	}

	// Preferably, we'd want to pass this directly as parameters
	// But passing as parameters results in a number of run-time errors
	onMount(async () => {
		register();
		const swiperEl = <any>document.querySelector('swiper-container');
		const swiperParams = {
			slidesPerView: 1,
			rewind: true,
			spaceBetween: 20,
			autoplay: {
				delay: 3000
			},
			pagination: {
				dynamicBullets: true
			},
			breakpoints: {
				640: {
					slidesPerView: 2
				},
				1024: {
					slidesPerView: 3
				}
			}
		};
		(<any>Object).assign(swiperEl, swiperParams);
		swiperEl!.initialize();
	});
</script>

<div class="flex flex-wrap items-center justify-between m-6 max-w-screen-xl lg:mx-auto">
	<a class="inline-flex items-center justify-left w-full my-12" href="#projects" id="projects">
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

		<h1 class="text-4xl ml-2">Projects</h1>
	</a>

	<div class="items-center justify-center m-2 overflow-x-hidden w-full lg:max-w-screen-xl">
		<swiper-container init="false">
			{#each Projects as project, i}
				<swiper-slide
					id="slide{i}"
					class="project card card-compact w-96 bg-base-100 min-h-[450px]"
				>
					<figure
						on:mouseover={() => reveal(project)}
						on:mouseout={() => diffuse(project)}
						on:focus={() => reveal(project)}
						on:blur={() => diffuse(project)}
					>
						<a href={project.link} class="max-h-[200px] min-h-[200px] min-w-full object-cover">
							<img
								id={project.title}
								class="max-h-[200px] min-h-[200px] min-w-full object-cover rounded-box"
								src={project.diffusion}
								alt="Project screenshot"
							/>
						</a>
					</figure>

					<div class="card-body max-h-[150px] min-h-[150px]">
						<h2 class="card-title">{project.title}</h2>
						<p class="max-h-[75px] min-h-[75px]">
							{project.description}
						</p>
						<div class="card-actions justify-end">
							<a class="btn" href={project.link}>View</a>
						</div>
					</div>
				</swiper-slide>
			{/each}
		</swiper-container>
	</div>

	<div class="w-full justify-center lg:justify-end flex">
		<label for="projectsModal" class="cursor-pointer btn gap-2 right-0">
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
				><path
					d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
				/><path d="M9 18c-4.51 2-5-2-7-2" /></svg
			> GitHub Projects</label
		>
		<input type="checkbox" id="projectsModal" class="modal-toggle" />
		<label for="projectsModal" class="modal modal-bottom cursor-pointer sm:modal-middle">
			<label class="modal-box max-h-[50%] lg:max-h-[75%]" for=""><GithubProjects /></label>
		</label>
	</div>
</div>
