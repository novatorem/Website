// Playback state for the On repeat previews, kept out of the UI components.
// The audio element is attached once mounted; everything else is plain state.
import type { Track } from '#lib/types/track.ts';

const DEFAULT_VOLUME = 0.6;
const FADE_MS = 900;
const PREVIEW_SECONDS = 30;

function storedVolume() {
	try {
		const saved = Number(localStorage.getItem('volume'));
		return saved > 0 && saved <= 1 ? saved : DEFAULT_VOLUME;
	} catch {
		return DEFAULT_VOLUME;
	}
}

export class Player {
	readonly tracks: Track[];
	// Indexes of the tracks that have a preview to play
	readonly playable: number[];

	index = $state(-1);
	playing = $state(false);
	time = $state(0);
	duration = $state(PREVIEW_SECONDS);
	volume = $state(DEFAULT_VOLUME);
	muted = $state(false);
	// iOS ignores scripted volume (the hardware buttons own it), so the slider hides there
	volumeSupported = $state(true);

	#audio: HTMLAudioElement | null = null;
	#fade = 0;
	#clock = 0;

	constructor(tracks: Track[]) {
		this.tracks = tracks;
		this.playable = tracks.flatMap((t, i) => (t.previewUrl ? [i] : []));
	}

	get shownIndex() {
		return this.index === -1 ? (this.playable[0] ?? 0) : this.index;
	}

	get shown(): Track | undefined {
		return this.tracks[this.shownIndex];
	}

	get length() {
		return Number.isFinite(this.duration) && this.duration > 0 ? this.duration : PREVIEW_SECONDS;
	}

	get status() {
		if (this.playing) return 'Playing';
		return this.index === -1 ? 'Preview' : 'Paused';
	}

	attach(audio: HTMLAudioElement) {
		this.#audio = audio;
		this.volume = storedVolume();
		audio.volume = 0.5;
		this.volumeSupported = audio.volume === 0.5;
		audio.volume = this.volume;

		const onPlay = () => {
			this.playing = true;
			this.#tick();
		};
		const onPause = () => {
			this.playing = false;
			cancelAnimationFrame(this.#clock);
		};
		const onDuration = () => (this.duration = audio.duration);
		const onEnded = () => this.skip(1);
		audio.addEventListener('play', onPlay);
		audio.addEventListener('pause', onPause);
		audio.addEventListener('durationchange', onDuration);
		audio.addEventListener('ended', onEnded);

		if ('mediaSession' in navigator) {
			navigator.mediaSession.setActionHandler('nexttrack', () => this.skip(1));
			navigator.mediaSession.setActionHandler('previoustrack', () => this.skip(-1));
		}

		return () => {
			cancelAnimationFrame(this.#fade);
			cancelAnimationFrame(this.#clock);
			audio.removeEventListener('play', onPlay);
			audio.removeEventListener('pause', onPause);
			audio.removeEventListener('durationchange', onDuration);
			audio.removeEventListener('ended', onEnded);
			this.#audio = null;
		};
	}

	async play(i: number) {
		const audio = this.#audio;
		const track = this.tracks[i];
		if (!audio || !track?.previewUrl) return;

		if (i === this.index && !audio.paused) {
			audio.pause();
			return;
		}
		if (i !== this.index) {
			this.index = i;
			this.time = 0;
			audio.src = track.previewUrl;
			this.#announce(track);
		}

		this.#fadeIn();
		try {
			await audio.play();
		} catch {
			// Superseded by a newer play() or blocked by the browser; the state sync below covers both
		}
		// Only the most recent request may update the UI, so a slow, aborted play can't
		// mark a newer track as paused
		if (this.index === i) this.playing = !audio.paused;
	}

	toggle() {
		this.play(this.shownIndex);
	}

	skip(direction: 1 | -1) {
		const list = this.playable;
		if (!list.length) return;
		// Before anything has played, Next starts the first track and Previous the last
		const at = this.index === -1 ? (direction === 1 ? -1 : 0) : list.indexOf(this.index);
		this.play(list[(at + direction + list.length) % list.length]);
	}

	seek(seconds: number) {
		if (this.#audio) this.#audio.currentTime = seconds;
		this.time = seconds;
	}

	setVolume(value: number) {
		cancelAnimationFrame(this.#fade);
		this.volume = value;
		this.muted = value === 0;
		if (this.#audio) {
			this.#audio.volume = value;
			this.#audio.muted = this.muted;
		}
		try {
			localStorage.setItem('volume', String(value || DEFAULT_VOLUME));
		} catch {
			// Not persisted this visit
		}
	}

	toggleMute() {
		this.muted = !this.muted;
		if (!this.muted && this.volume === 0) this.volume = DEFAULT_VOLUME;
		if (this.#audio) {
			this.#audio.muted = this.muted;
			this.#audio.volume = this.volume;
		}
	}

	// Every start ramps up from silence so pressing play never blasts
	#fadeIn() {
		const audio = this.#audio;
		if (!audio || !this.volumeSupported) return;
		cancelAnimationFrame(this.#fade);
		const start = performance.now();
		const to = this.volume;
		audio.volume = 0;
		const step = (now: number) => {
			const t = Math.min(1, (now - start) / FADE_MS);
			audio.volume = to * (1 - (1 - t) ** 3);
			if (t < 1) this.#fade = requestAnimationFrame(step);
		};
		this.#fade = requestAnimationFrame(step);
	}

	// Follows the playhead every frame while playing, for a smooth progress bar
	#tick() {
		const audio = this.#audio;
		if (!audio) return;
		this.time = audio.currentTime;
		if (!audio.paused) this.#clock = requestAnimationFrame(() => this.#tick());
	}

	#announce(track: Track) {
		if (!('mediaSession' in navigator)) return;
		navigator.mediaSession.metadata = new MediaMetadata({
			title: track.title,
			artist: track.artist,
			album: 'On repeat · novac.dev',
			artwork: track.artwork ? [{ src: track.artwork, sizes: '400x400', type: 'image/jpeg' }] : []
		});
	}
}

export function clock(seconds: number) {
	const s = Math.max(0, Math.floor(seconds || 0));
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
