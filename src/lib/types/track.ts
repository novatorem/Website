export interface Track {
	title: string;
	artist: string;
	spotifyUrl: string;
	// Preview clip, artwork and Apple Music link from the iTunes Search API, when Apple has the song
	previewUrl: string | null;
	artwork: string | null;
	artworkSmall: string | null;
	appleMusicUrl: string | null;
	album: string | null;
}
