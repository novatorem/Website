export interface Cover {
	// Sized for the reading-now spotlight; `thumb` is for list rows
	url: string;
	thumb: string;
	width: number;
	height: number;
	// Dominant colour, shown while the cover loads
	color: string | null;
}

export interface Book {
	title: string;
	authors: string[];
	pages: number | null;
	cover: Cover | null;
	url: string;
	// ISO dates
	started: string | null;
	finished: string | null;
	// Current page, for books in progress
	progress: number | null;
}

export interface Bookshelf {
	profileUrl: string;
	reading: Book[];
	finished: Book[];
	stats: {
		read: number;
		readThisYear: number;
		pagesRead: number;
		wantToRead: number;
	};
}
