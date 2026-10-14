import type { VoicingStyle } from '#lib/theory/voicing.ts';
import { load, save } from './storage';

export type LabelMode = 'degree' | 'letter' | 'solfege';
export type Theme = 'auto' | 'light' | 'dark';

interface SettingsData {
	volume: number;
	labels: LabelMode;
	staff: boolean;
	voicing: VoicingStyle;
	theme: Theme;
	soundHintSeen: boolean;
	/** bumped when the default voicing changes, so a saved old default moves to the new one */
	voicingVersion?: number;
}

const KEY = 'jhb:settings';
const DEFAULTS: SettingsData = {
	volume: 0.8,
	labels: 'degree',
	staff: false,
	voicing: 'spread',
	theme: 'auto',
	soundHintSeen: false
};

class Settings {
	volume = $state(DEFAULTS.volume);
	labels = $state<LabelMode>(DEFAULTS.labels);
	staff = $state(DEFAULTS.staff);
	voicing = $state<VoicingStyle>(DEFAULTS.voicing);
	theme = $state<Theme>(DEFAULTS.theme);
	soundHintSeen = $state(DEFAULTS.soundHintSeen);

	/** Call once from the root layout (browser only). */
	init() {
		const { voicingVersion, ...d } = load(KEY, DEFAULTS);
		// the first default was 'rootless'; a stored 'rootless' from before v2 was never a choice
		if ((voicingVersion ?? 1) < 2 && d.voicing === 'rootless') d.voicing = DEFAULTS.voicing;
		Object.assign(this, d);
		$effect.root(() => {
			$effect(() => {
				save(KEY, {
					volume: this.volume,
					labels: this.labels,
					staff: this.staff,
					voicing: this.voicing,
					theme: this.theme,
					soundHintSeen: this.soundHintSeen,
					voicingVersion: 2
				});
			});
			$effect(() => {
				const t = this.theme;
				if (t === 'auto') delete document.documentElement.dataset.theme;
				else document.documentElement.dataset.theme = t;
			});
		});
	}
}

export const settings = new Settings();
