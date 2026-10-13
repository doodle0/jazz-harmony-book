// Note labels for the keyboard: scale degree (relative to the chord or scale root),
// letter name, or movable-do 도레미 (relative to the key), per the Settings drawer.

import type { LabelMode } from '#lib/stores/settings.svelte.ts';
import { noteName, prettyDegree, solfege, type Pitch } from './pitch';

export function noteLabel(mode: LabelMode, p: Pitch, degree: string, keyTonic: Pitch): string {
	switch (mode) {
		case 'letter':
			return noteName(p);
		case 'solfege':
			return solfege(p, keyTonic);
		default:
			return prettyDegree(degree);
	}
}
