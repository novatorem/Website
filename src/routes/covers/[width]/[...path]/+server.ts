// Hardcover serves covers at full resolution (often 1400px and several hundred KB) and ignores
// resize parameters, so each cover the page uses is fetched once at build and written out small.
// The prerender crawler finds these URLs in the page's <img> tags; nothing is proxied at runtime.
import { error } from '@sveltejs/kit';
import sharp from 'sharp';
import { COVER_HOST, COVER_WIDTHS } from '#lib/server/covers.ts';

export const prerender = true;

export async function GET({ params, fetch }) {
	const width = Number(params.width);
	if (!COVER_WIDTHS.includes(width) || !params.path.endsWith('.webp')) error(404);

	const source = `https://${COVER_HOST}/${params.path.slice(0, -'.webp'.length)}`;
	const res = await fetch(source);
	if (!res.ok) error(502, `Could not fetch the cover ${source}: ${res.status}`);

	const image = await sharp(new Uint8Array(await res.arrayBuffer()))
		.resize({ width, withoutEnlargement: true })
		.webp({ quality: 80 })
		.toBuffer();
	return new Response(new Uint8Array(image), {
		headers: { 'content-type': 'image/webp' }
	});
}
