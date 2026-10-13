// Widget plumbing: a deck of examples with 🎲 shuffle (prefers a different style
// next), and a helper that turns an example into something the player can play.

import type { PlaySource } from '#lib/stores/player.svelte.ts';
import { parseKey, type Key } from '#lib/theory/progression.ts';
import { arrange, visible, type ArrangeOptions, type Example } from './example';

export class Deck {
	i = $state(0);
	readonly examples: Example[];

	constructor(examples: Example[]) {
		this.examples = visible(examples);
	}

	get current(): Example {
		return this.examples[this.i];
	}

	get label() {
		return `${this.i + 1}/${this.examples.length}`;
	}

	/** Next example, skipping ahead to one in another style when possible. */
	next() {
		const n = this.examples.length;
		const style = this.current.style;
		for (let k = 1; k < n; k++) {
			const j = (this.i + k) % n;
			if (this.examples[j].style !== style) {
				this.i = j;
				return;
			}
		}
		this.i = (this.i + 1) % n;
	}
}

export function exampleSource(id: string, ex: Example, opts: Omit<ArrangeOptions, 'key'> = {}, title?: string): PlaySource {
	return {
		id,
		title: title ?? ex.tune?.title ?? ex.title,
		style: opts.style ?? ex.style,
		usualKey: parseKey(ex.key),
		tempo: ex.tempo,
		build: (key: Key) => arrange(ex, { ...opts, key }).seq
	};
}
