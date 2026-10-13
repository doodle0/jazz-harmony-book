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
}

const KEY = 'jhb:settings';
const DEFAULTS: SettingsData = {
	volume: 0.8,
	labels: 'degree',
	staff: false,
	voicing: 'rootless',
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
		const d = load(KEY, DEFAULTS);
		Object.assign(this, d);
		$effect.root(() => {
			$effect(() => {
				save(KEY, {
					volume: this.volume,
					labels: this.labels,
					staff: this.staff,
					voicing: this.voicing,
					theme: this.theme,
					soundHintSeen: this.soundHintSeen
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
