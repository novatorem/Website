// Build-time Hardcover lookup for the Bookshelf section. The token is private and
// this module is server-only, so it never reaches the browser.
import { building } from '$app/env';
import { HARDCOVER_TOKEN } from '$app/env/private';
import { site } from '#lib/site.ts';
import type { Book, Bookshelf } from '#lib/types/book.ts';
import { coverAt } from './covers.ts';

const ENDPOINT = 'https://api.hardcover.app/v1/graphql';
const RECENT = 8;

// One request: everything hangs off `me`, which counts as a single field against the rate limit
const QUERY = `
	query Bookshelf {
		me {
			reading: user_books(where: { status_id: { _eq: 2 } }, order_by: { updated_at: desc }) {
				...shelfBook
				user_book_reads(order_by: { id: desc }, limit: 1) {
					started_at
					finished_at
					progress_pages
				}
			}
			finished: user_books(
				where: { status_id: { _eq: 3 } }
				order_by: { last_read_date: desc_nulls_last }
			) {
				...shelfBook
			}
			wantToRead: user_books(where: { status_id: { _eq: 1 } }) {
				id
			}
		}
	}

	fragment shelfBook on user_books {
		date_added
		first_started_reading_date
		last_read_date
		book {
			title
			slug
			pages
			image { url width height color }
			contributions { contribution author { name } }
		}
		edition {
			pages
			image { url width height color }
		}
	}
`;

type Image = {
	url: string | null;
	width: number | null;
	height: number | null;
	color?: string | null;
};

type UserBook = {
	date_added: string | null;
	first_started_reading_date: string | null;
	last_read_date: string | null;
	book: {
		title: string;
		slug: string;
		pages: number | null;
		image: Image | null;
		contributions: { contribution: string | null; author: { name: string } | null }[];
	};
	edition: { pages: number | null; image: Image | null } | null;
	user_book_reads?: {
		started_at: string | null;
		finished_at: string | null;
		progress_pages: number | null;
	}[];
};

type Me = { reading: UserBook[]; finished: UserBook[]; wantToRead: { id: number }[] };

function toBook(entry: UserBook): Book {
	// The book's main cover reads best on the shelf; the logged edition (which may be a
	// translation) still supplies the page count, since reading progress is tracked against it
	const image = entry.book.image?.url ? entry.book.image : entry.edition?.image;
	const read = entry.user_book_reads?.[0];
	return {
		title: entry.book.title,
		// Writers only: translators and cover artists are credited on Hardcover itself
		authors: entry.book.contributions
			.filter((c) => !c.contribution || c.contribution === 'Author')
			.flatMap((c) => (c.author ? [c.author.name] : [])),
		pages: entry.edition?.pages ?? entry.book.pages,
		cover:
			image?.url && image.width && image.height
				? {
						url: coverAt(image.url, 560),
						thumb: coverAt(image.url, 112),
						width: image.width,
						height: image.height,
						color: image.color ?? null
					}
				: null,
		url: `https://hardcover.app/books/${entry.book.slug}`,
		started: read?.started_at ?? entry.first_started_reading_date ?? entry.date_added,
		finished: entry.last_read_date,
		progress: read?.progress_pages ?? null
	};
}

function summarise(me: Me): Bookshelf {
	const finished = me.finished.map(toBook);
	const year = String(new Date().getFullYear());

	return {
		profileUrl: site.hardcover,
		// A book can stay on the Reading shelf after its latest read-through was marked finished;
		// only books with an open read-through count as in progress
		reading: me.reading.filter((entry) => !entry.user_book_reads?.[0]?.finished_at).map(toBook),
		finished: finished.slice(0, RECENT),
		stats: {
			read: finished.length,
			readThisYear: finished.filter((b) => b.finished?.startsWith(year)).length,
			pagesRead: finished.reduce((sum, b) => sum + (b.pages ?? 0), 0),
			wantToRead: me.wantToRead.length
		}
	};
}

export async function loadBookshelf(fetch: typeof globalThis.fetch): Promise<Bookshelf | null> {
	if (!HARDCOVER_TOKEN) {
		console.warn('HARDCOVER_TOKEN is not set: the Bookshelf section links to Hardcover instead');
		return null;
	}
	const authorization = HARDCOVER_TOKEN.startsWith('Bearer ')
		? HARDCOVER_TOKEN
		: `Bearer ${HARDCOVER_TOKEN}`;

	try {
		const res = await fetch(ENDPOINT, {
			method: 'POST',
			headers: { 'content-type': 'application/json', authorization },
			body: JSON.stringify({ query: QUERY })
		});
		const body: { data?: { me: Me | Me[] }; errors?: { message: string }[] } = await res.json();
		if (!res.ok || body.errors?.length || !body.data) {
			const detail = body.errors?.map((e) => e.message).join('; ') ?? res.statusText;
			throw new Error(`Hardcover responded ${res.status}: ${detail}`);
		}
		// `me` comes back as a one-item list
		const me = Array.isArray(body.data.me) ? body.data.me[0] : body.data.me;
		if (!me) throw new Error('Hardcover returned no user for this token');
		return summarise(me);
	} catch (err) {
		// With a token present, a production build fails rather than shipping a stale shelf
		if (building) throw new Error('Could not load the bookshelf from Hardcover', { cause: err });
		console.warn('Could not load the bookshelf from Hardcover:', err);
		return null;
	}
}
