import { loadBookshelf } from '#lib/server/hardcover.ts';
import { loadTracks } from '#lib/server/itunes.ts';
import type { PageServerLoad } from './$types';

// Runs at build time (the page is prerendered); both sources are fetched in parallel
export const load: PageServerLoad = async ({ fetch }) => {
	const [tracks, bookshelf] = await Promise.all([loadTracks(fetch), loadBookshelf(fetch)]);
	return { tracks, bookshelf };
};
