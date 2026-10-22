import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => ({
	plugins: [
		tailwindcss(),
		sveltekit({
			paths: {
				base: (loadEnv(mode, '.', 'BASE_PATH').BASE_PATH ?? '') as '' | `/${string}`
			},
			// Every page is prerendered, so the site deploys as plain static files from build/.
			// GitHub Pages, Cloudflare Pages and Vercel (see vercel.json) all serve 404.html
			// for unknown routes, which renders +error.svelte. On Vercel the adapter warns that
			// its zero-config mode is off; that's intended, as vercel.json serves build/ instead.
			adapter: adapter({ fallback: '404.html' })
		})
	]
}));
