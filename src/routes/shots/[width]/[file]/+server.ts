// Prerendered WebP copies of the project screenshots in static/images/projects; the
// crawler finds them through each <img> srcset. Nothing here runs after the build.
import { error } from '@sveltejs/kit';
import sharp from 'sharp';
import { asset } from '#lib/assets.ts';
import projects from '#lib/data/projects.json';
import { shotWidths } from '#lib/shots.ts';

export const prerender = true;

export async function GET({ params, fetch }) {
	const width = Number(params.width);
	const name = params.file.replace(/\.webp$/, '');
	const project = projects.find((p) => p.image.endsWith(`/${name}`));
	if (!project || !params.file.endsWith('.webp') || !shotWidths(project.width).includes(width)) {
		error(404);
	}
	const res = await fetch(asset(project.image));
	if (!res.ok) error(500, `Could not read ${project.image}`);
	const source = new Uint8Array(await res.arrayBuffer());
	// A WebP already at this width is as small as it gets; re-encoding would only grow it
	const image =
		name.endsWith('.webp') && width >= project.width
			? source
			: new Uint8Array(
					await sharp(source)
						.resize({ width, withoutEnlargement: true })
						.webp({ quality: 82 })
						.toBuffer()
				);
	return new Response(image, { headers: { 'content-type': 'image/webp' } });
}
