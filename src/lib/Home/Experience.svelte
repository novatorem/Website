<script lang="ts">
	import work from '../Data/work.json?raw';
	import education from '../Data/education.json?raw';

	interface experience {
		institution: string;
		role: string;
		location: string;
		duration: string;
		short: string;
	}

	let Work: experience[] = JSON.parse(work);
	let Education: experience[] = JSON.parse(education);
</script>

<div class="flex flex-wrap items-center justify-between m-6 max-w-screen-xl lg:mx-auto">
	<a class="inline-flex items-center justify-left w-full my-12" href="#experience" id="experience">
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
			><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" /></svg
		>

		<h1 class="text-4xl ml-2">Experience</h1>
	</a>
	<div class="work max-w-full">
		<a class="inline-flex items-center justify-left text-left w-full" href="#work" id="work">
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
				><line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" /><line
					x1="10"
					y1="18"
					x2="10"
					y2="11"
				/><line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" /><polygon
					points="12 2 20 7 4 7"
				/></svg
			>

			<h1 class="text-2xl ml-2">Work</h1>
		</a>
		<div class="overflow-x-auto">
			<ul class="steps md:steps-vertical md:min-w-[400px]">
				{#each Work as work}
					<li
						data-content=""
						class="step h-[250px] step-icon-{work.short} !min-w-[320px] max-w-[320px] m-1"
					>
						<div class="stats stats-vertical bg-base-200 min-w-[310px] max-w-[310px]">
							<div class="stat">
								<div class="stat-value text-xl text-left">{work.institution}</div>
								<div class="stat-desc text-left">{work.role}</div>
							</div>

							<div class="stat">
								<div class="stat-title text-left">{work.location}</div>
								<div class="stat-desc text-left">{work.duration}</div>
							</div>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<div class="education max-w-full">
		<a
			class="inline-flex items-center justify-left text-left w-full"
			href="#education"
			id="education"
		>
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
				><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg
			>

			<h1 class="text-2xl ml-2">Education</h1>
		</a>
		<div class="overflow-x-auto">
			<ul class="steps md:steps-vertical md:min-w-[400px]">
				{#each Education as education}
					<li
						data-content=""
						class="step h-[250px] step-icon-{education.short} !min-w-[320px] max-w-[320px] m-1"
					>
						<div class="stats stats-vertical bg-base-200 min-w-[310px] max-w-[310px]">
							<div class="stat">
								<div class="stat-value text-xl text-left">{education.institution}</div>
								<div class="stat-title text-left">{education.role}</div>
							</div>

							<div class="stat">
								<div class="stat-title text-left">{education.location}</div>
								<div class="stat-desc text-left">{education.duration}</div>
							</div>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>

<style>
	.step-icon-savvyy:after,
	.step-icon-cast:after,
	.step-icon-uoft:after,
	.step-icon-ib:after,
	.step-icon-bibf:after {
		background-repeat: no-repeat;
		background-position: center;
	}

	.step-icon-savvyy:after {
		background-image: url('/images/experience/savvyy.webp');
		background-size: 50%;
	}

	.step-icon-cast:after {
		background-image: url('/images/experience/cast.webp');
		background-size: 75%;
	}

	.step-icon-uoft:after {
		background-image: url('/images/experience/uoft.webp');
		background-size: 75%;
	}

	.step-icon-ib:after {
		background-image: url('/images/experience/ib.webp');
		background-size: 60%;
	}

	.step-icon-bibf:after {
		background-image: url('/images/experience/bibf.webp');
		background-size: 75%;
	}
</style>
