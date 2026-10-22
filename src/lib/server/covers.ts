import { asset } from '#lib/assets.ts';

// Covers are re-encoded at build by src/routes/covers: list thumbnails render at 36px wide and
// the current book at up to 272px, so these widths cover 3x and 2x screens respectively
export const COVER_HOST = 'assets.hardcover.app';
export const COVER_WIDTHS = [112, 560];

export function coverAt(url: string, width: (typeof COVER_WIDTHS)[number]): string {
	const { hostname, pathname } = new URL(url);
	return hostname === COVER_HOST ? asset(`/covers/${width}${pathname}.webp`) : url;
}
