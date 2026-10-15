// Line icons from Lucide (lucide.dev), flattened to path data so one component can draw them all.
// `filled` icons are solid shapes; the rest are 24px strokes.
type IconDef = { d: string[]; filled?: boolean };

const circle = (cx: number, cy: number, r: number) =>
	`M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

export const icons = {
	'arrow-up-right': { d: ['M7 7h10v10', 'M7 17 17 7'] },
	'arrow-down': { d: ['M12 5v14', 'm19 12-7 7-7-7'] },
	'chevron-down': { d: ['m6 9 6 6 6-6'] },
	close: { d: ['M18 6 6 18', 'm6 6 12 12'] },
	mail: {
		d: [
			'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
			'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'
		]
	},
	github: {
		d: [
			'M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4',
			'M9 18c-4.51 2-5-2-7-2'
		]
	},
	linkedin: {
		d: [
			'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z',
			'M2 9h4v12H2z',
			circle(4, 4, 2)
		]
	},
	star: {
		d: [
			'M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2Z'
		],
		filled: true
	},
	fork: {
		d: [
			circle(12, 18, 3),
			circle(6, 6, 3),
			circle(18, 6, 3),
			'M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9',
			'M12 12v3'
		]
	},
	code: { d: ['m16 18 6-6-6-6', 'm8 6-6 6 6 6'] },
	sun: {
		d: [
			circle(12, 12, 4),
			'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41'
		]
	},
	moon: { d: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z', 'M20 3v4', 'M22 5h-4'] },
	play: {
		d: ['M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z'],
		filled: true
	},
	pause: {
		d: [
			'M7 4h2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z',
			'M15 4h2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z'
		],
		filled: true
	},
	'skip-back': { d: ['M19 20 9 12l10-8v16Z', 'M5 19V5'] },
	'skip-forward': { d: ['m5 4 10 8-10 8V4Z', 'M19 5v14'] },
	volume: {
		d: [
			'M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z',
			'M16 9a5 5 0 0 1 0 6',
			'M19.364 18.364a9 9 0 0 0 0-12.728'
		]
	},
	'volume-off': {
		d: [
			'M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z',
			'm22 9-6 6',
			'm16 9 6 6'
		]
	}
} satisfies Record<string, IconDef>;

export type IconName = keyof typeof icons;
