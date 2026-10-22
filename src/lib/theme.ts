import { asset } from '#lib/assets.ts';

// The light follows the OS until the visitor picks one; a pick lives on <html data-theme>
export type Light = 'day' | 'night';

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

export function osLight(): Light {
	return darkQuery().matches ? 'night' : 'day';
}

export function currentLight(): Light {
	const forced = document.documentElement.dataset.theme;
	return forced === 'day' || forced === 'night' ? forced : osLight();
}

// Choosing the light the OS already uses goes back to following the OS
export function setLight(light: Light) {
	const root = document.documentElement;
	try {
		if (light === osLight()) {
			delete root.dataset.theme;
			localStorage.removeItem('theme');
		} else {
			root.dataset.theme = light;
			localStorage.setItem('theme', light);
		}
	} catch {
		// Storage can be unavailable (private mode); the choice still applies for this visit
		if (light !== osLight()) root.dataset.theme = light;
	}
}

// The tab icon is the logo in the current light's colours: favicon.svg follows the OS by itself,
// a forced light uses its own file. app.html sets it before first paint; this keeps it in sync.
export function paintTabIcon() {
	const icon = document.getElementById('tab-icon');
	if (!(icon instanceof HTMLLinkElement)) return;
	const forced = document.documentElement.dataset.theme;
	const href = asset(
		forced === 'day' || forced === 'night' ? `/favicon-${forced}.svg` : '/favicon.svg'
	);
	if (icon.href === new URL(href, location.href).href) return;
	// Replaced rather than edited: Chrome ignores href changes on an existing icon link
	const next = icon.cloneNode() as HTMLLinkElement;
	next.setAttribute('href', href);
	icon.replaceWith(next);
}

// Calls back whenever the light changes, from the OS or from the toggle
export function onLightChange(callback: () => void) {
	const query = darkQuery();
	const observer = new MutationObserver(callback);
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
	query.addEventListener('change', callback);
	return () => {
		observer.disconnect();
		query.removeEventListener('change', callback);
	};
}
