// Project screenshots are re-encoded at build by src/routes/shots as WebP at a few widths,
// never wider than the original, so the browser can pick the smallest that stays sharp
export const SHOT_STEPS = [640, 1280];

export function shotWidths(width: number): number[] {
	return [...new Set([...SHOT_STEPS.filter((w) => w < width), Math.min(width, 1280)])];
}

// `/images/projects/rez.jpg` -> `/shots/640/rez.jpg.webp`
export function shotAt(image: string, width: number): string {
	return `/shots/${width}/${image.split('/').pop()}.webp`;
}

export function shotSrcset(image: string, width: number): string {
	return shotWidths(width)
		.map((w) => `${shotAt(image, w)} ${w}w`)
		.join(', ');
}
