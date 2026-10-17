// Build-time iTunes lookup for the On repeat player
import { building } from '$app/env';
import tracklist from '#lib/data/tracks.json';
import type { Track } from '#lib/types/track.ts';

type LookupResult = {
	trackId: number;
	previewUrl?: string;
	artworkUrl100?: string;
	trackViewUrl?: string;
	collectionName?: string;
};

// iTunes artwork URLs encode their size; ask for the two sizes the player shows
const artworkAt = (url: string | undefined, px: number) =>
	url?.replace('100x100bb', `${px}x${px}bb`) ?? null;

// One batched iTunes lookup resolves preview clips and artwork for the whole tracklist
export async function loadTracks(fetch: typeof globalThis.fetch): Promise<Track[]> {
	const ids = tracklist.flatMap((t) => (t.itunesId ? [t.itunesId] : [])).join(',');
	const found = new Map<number, LookupResult>();

	try {
		const res = await fetch(`https://itunes.apple.com/lookup?id=${ids}&country=CA`);
		if (!res.ok) throw new Error(`iTunes lookup responded with ${res.status}`);
		const body: { results: LookupResult[] } = await res.json();
		for (const result of body.results) found.set(result.trackId, result);
	} catch (err) {
		// A production build fails instead of quietly deploying a player with no previews;
		// the host then keeps the last good deploy live
		if (building) throw new Error('Could not load song previews from iTunes', { cause: err });
		console.warn('Could not load song previews:', err);
	}

	const tracks: Track[] = tracklist.map((t) => {
		const hit = t.itunesId ? found.get(t.itunesId) : undefined;
		return {
			title: t.title,
			artist: t.artist,
			spotifyUrl: `https://open.spotify.com/track/${t.spotifyId}`,
			previewUrl: hit?.previewUrl ?? null,
			artwork: artworkAt(hit?.artworkUrl100, 400),
			artworkSmall: artworkAt(hit?.artworkUrl100, 80),
			appleMusicUrl: hit?.trackViewUrl ?? null,
			album: hit?.collectionName ?? null
		};
	});

	return tracks;
}
