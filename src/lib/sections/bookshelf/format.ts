const thisYear = new Date().getFullYear();

// "Sep 6", or "Sep 6, 2024" outside the current year
export function shortDate(iso: string | null) {
	if (!iso) return null;
	const date = new Date(`${iso.slice(0, 10)}T12:00:00`);
	return date.toLocaleDateString('en', {
		month: 'short',
		day: 'numeric',
		...(date.getFullYear() === thisYear ? {} : { year: 'numeric' })
	});
}

export const count = (n: number) => new Intl.NumberFormat('en').format(n);

export const byline = (authors: string[]) =>
	authors.length > 2 ? `${authors[0]} and others` : authors.join(' and ');
