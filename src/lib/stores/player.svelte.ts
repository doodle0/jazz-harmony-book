// The one global player behind the sticky mini-player. Starting any widget takes it
// over, so only one thing sounds at a time (plan §5). The audio engine module is
// imported on first use, keeping it out of the initial bundle.

import type { Engine } from '#lib/audio/engine.ts';
import type { Inst, Sequence, Style } from '#lib/audio/types.ts';
import { sameKey, type Key } from '#lib/theory/progression.ts';
import { settings } from './settings.svelte';

export interface PlaySource {
	/** widget instance id; replaying the same id keeps the reader's key and tempo */
	id: string;
	/** which example the widget is showing; a new one resets tempo (and key, unless the reader picked one) */
	content?: string;
	title: string;
	style?: Style;
	usualKey: Key;
	/** whether the key picker offers major or minor keys */
	tempo: number;
	loop?: boolean;
	build: (key: Key) => Sequence;
	/** set false for things like scale drones where transposing makes no sense */
	transposable?: boolean;
}

let enginePromise: Promise<Engine> | null = null;

export function loadEngine(): Promise<Engine> {
	enginePromise ??= import('#lib/audio/engine.ts').then((m) => {
		const e = m.getEngine();
		e.setVolume(settings.volume);
		return e;
	});
	return enginePromise;
}

class Player {
	source = $state.raw<PlaySource | null>(null);
	key = $state.raw<Key | null>(null);
	tempo = $state(120);
	loop = $state(true);
	playing = $state(false);
	loading = $state(false);
	/** index of the chord currently sounding, -1 when idle */
	mark = $state(-1);
	/** the reader chose `key` themselves (mini-player, key buttons), so it survives a shuffle */
	private keyPinned = $state(false);
	private token = 0;

	isActive(id: string) {
		return this.source?.id === id;
	}

	isPlaying(id: string) {
		return this.playing && this.source?.id === id;
	}

	/** Whether a key carries over to an example whose usual key is `usual`. */
	private keeps(src: { content?: string }, content: string | undefined, usual: Key): boolean {
		if (content === undefined || src.content === content) return true;
		return this.keyPinned && !!this.key && this.key.minor === usual.minor;
	}

	/**
	 * The key a widget should display: the reader's key while it's the active source and
	 * still showing the same example (or the reader picked the key), else the usual key.
	 */
	keyFor(id: string, usual: Key, content?: string): Key {
		if (this.source?.id !== id || !this.key) return usual;
		return this.keeps(this.source, content, usual) ? this.key : usual;
	}

	async play(src: PlaySource, opts: { loop?: boolean; key?: Key } = {}) {
		const token = ++this.token;
		if (this.source?.id !== src.id) {
			this.key = src.usualKey;
			this.tempo = src.tempo;
			this.keyPinned = false;
		} else if (this.source.content !== src.content) {
			// another example in the same widget (다른 예시): its own tempo, and its own key
			// unless the reader chose one
			this.tempo = src.tempo;
			if (!this.keeps(this.source, src.content, src.usualKey)) {
				this.key = src.usualKey;
				this.keyPinned = false;
			}
		}
		if (opts.key) {
			this.key = opts.key;
			this.keyPinned = true;
		}
		this.loop = opts.loop ?? src.loop ?? true;
		this.source = src;
		this.mark = -1;
		settings.soundHintSeen = true;
		const engine = await loadEngine();
		await engine.resume();
		const seq = src.build(this.key!);
		const needsLoad = seq.notes.some((n) => !engine.isLoaded(n.inst));
		if (needsLoad) {
			this.loading = true;
			try {
				await engine.loadFor(seq);
			} catch {
				this.loading = false;
				return;
			}
		}
		if (token !== this.token) return;
		this.loading = false;
		this.playing = true;
		engine.play(seq, {
			tempo: this.tempo,
			loop: this.loop,
			onMark: (i) => {
				if (token === this.token) this.mark = i;
			},
			onEnd: () => {
				if (token === this.token) {
					this.playing = false;
					this.mark = -1;
				}
			}
		});
	}

	/** Same source, new content (A/B switch): swap without restarting the groove. */
	async update(src: PlaySource) {
		if (!this.playing || this.source?.id !== src.id) return;
		this.source = src;
		const engine = await loadEngine();
		const seq = src.build(this.key!);
		await engine.loadFor(seq);
		engine.replace(seq);
	}

	async stop() {
		this.token++;
		this.playing = false;
		this.loading = false;
		this.mark = -1;
		if (enginePromise) (await enginePromise).stop();
	}

	toggle() {
		if (this.playing || this.loading) this.stop();
		else if (this.source) this.play(this.source);
	}

	async setKey(key: Key) {
		this.keyPinned = true;
		if (this.key && sameKey(this.key, key)) return;
		this.key = key;
		if (this.playing && this.source) {
			const engine = await loadEngine();
			engine.replace(this.source.build(key));
		}
	}

	async setTempo(bpm: number) {
		this.tempo = Math.max(40, Math.min(300, Math.round(bpm)));
		if (this.playing) (await loadEngine()).setTempo(this.tempo);
	}

	setLoop(loop: boolean) {
		this.loop = loop;
		if (this.playing && this.source) this.play(this.source, { loop });
	}

	/** Fire-and-forget notes (tapping a key) on top of whatever is playing. */
	async tap(inst: Inst, midi: number[], dur = 1.2, vel = 0.75) {
		const engine = await loadEngine();
		await engine.resume();
		settings.soundHintSeen = true;
		engine.playNow(inst, midi, dur, vel);
	}

	async setVolume(v: number) {
		settings.volume = v;
		if (enginePromise) (await enginePromise).setVolume(v);
	}
}

export const player = new Player();

/** Warm up: fetch the engine and piano/bass samples while the reader is reading. */
export function prefetchAudio() {
	loadEngine().then((e) => {
		e.load('piano');
		e.load('bass');
	});
}
