import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	// Hardcover API token for the Bookshelf section (https://hardcover.app/account/api).
	// Optional: without it the section shows a link to the Hardcover profile instead.
	HARDCOVER_TOKEN: {
		schema: (value) => value?.trim() || undefined
	}
});
