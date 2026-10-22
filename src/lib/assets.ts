import { asset as kitAsset } from '$app/paths';
import type { AssetPath } from '$app/types';

export function asset(path: string): string {
	return kitAsset(path as AssetPath);
}
