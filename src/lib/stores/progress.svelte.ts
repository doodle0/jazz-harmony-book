import { load, save } from './storage';

const KEY = 'jhb:heard';

class Progress {
	heard = $state<Record<string, boolean>>({});

	init() {
		this.heard = load<Record<string, boolean>>(KEY, {});
	}

	toggle(id: string) {
		this.heard = { ...this.heard, [id]: !this.heard[id] };
		save(KEY, this.heard);
	}

	count(prefix: string) {
		return Object.entries(this.heard).filter(([k, v]) => v && k.startsWith(prefix)).length;
	}
}

export const progress = new Progress();
