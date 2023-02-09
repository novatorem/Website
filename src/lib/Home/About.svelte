<div class="flex flex-wrap items-center justify-between m-6 max-w-screen-xl lg:mx-auto">
	<a class="inline-flex items-center justify-left w-full my-12" href="#about" id="about">
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
			><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line
				x1="12"
				y1="8"
				x2="12.01"
				y2="8"
			/></svg
		>

		<h1 class="text-3xl ml-2">About</h1>
	</a>

	<div class="flex flex-wrap items-center justify-around w-full text-left">
		<p class="pb-6">
			Thank you for visiting my portfolio page! I appreciate your interest in my work and
			achievements. If you'd like to learn more about me and what I do, be sure to check out my
			other pages. Connect with me on my social media profiles for updates on my latest projects and
			musings.
		</p>

		<label for="modal" class="btn">Technologies & Credits</label>

		<input type="checkbox" id="modal" class="modal-toggle" />
		<label for="modal" class="modal modal-bottom cursor-pointer sm:modal-middle">
			<label class="modal-box" for="">
				<h3 class="font-bold text-lg mb-4">Technologies & Credits</h3>
				<div class="overflow-x-auto w-full">
					<table class="table table-zebra w-full">
						<thead>
							<tr>
								<th />
								<th>Source</th>
								<th>Description</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>
									<img
										class="w-6 h-6 object-contain"
										src="/images/about/svelte.webp"
										alt="Source logo"
									/>
								</td>
								<th><a href="https://kit.svelte.dev/">SvelteKit</a></th>
								<th>Front-end framework </th>
							</tr>
							<tr>
								<td>
									<img
										class="w-6 h-6 object-contain"
										src="/images/about/tailwind.webp"
										alt="Source logo"
									/>
								</td>
								<th><a href="https://tailwindcss.com/">TailwindCSS</a></th>
								<th>CSS framework </th>
							</tr>
							<tr>
								<td>
									<img
										class="w-6 h-6 object-contain"
										src="/images/about/daisy.ico"
										alt="Source logo"
									/>
								</td>
								<th><a href="https://daisyui.com/">DaisyUI</a></th>
								<th>Component library </th>
							</tr>
							<tr>
								<td>
									<img
										class="w-6 h-6 object-contain"
										src="/images/about/swiper.webp"
										alt="Source logo"
									/>
								</td>
								<th><a href="https://swiperjs.com/">SwiperJS</a></th>
								<th>Carousel component </th>
							</tr>
							<tr>
								<td>
									<img
										class="w-6 h-6 object-contain"
										src="/images/about/lucide.webp"
										alt="Source logo"
									/>
								</td>
								<th><a href="https://lucide.dev/icon/activity">Lucide</a></th>
								<th>Icons library </th>
							</tr>
						</tbody>
					</table>
				</div>
			</label>
		</label>
	</div>
</div>
