// Monochrome language marks for the GitHub list (paths from Simple Icons, drawn in currentColor)
import {
	siC,
	siCplusplus,
	siDotnet,
	siGo,
	siJavascript,
	siKotlin,
	siOpenjdk,
	siPython,
	siRust,
	siSvelte,
	siTypescript
} from 'simple-icons';

const icons: Record<string, { path: string }> = {
	C: siC,
	'C++': siCplusplus,
	'C#': siDotnet,
	Go: siGo,
	Java: siOpenjdk,
	JavaScript: siJavascript,
	Kotlin: siKotlin,
	Python: siPython,
	Rust: siRust,
	Svelte: siSvelte,
	TypeScript: siTypescript
};

// Returns the language's mark, or null so the caller can fall back to a generic code glyph
export function languageIcon(language: string): string | null {
	return icons[language]?.path ?? null;
}
