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
	private token = 0;

	isActive(id: string) {
		return this.source?.id === id;
	}

	isPlaying(id: string) {
		return this.playing && this.source?.id === id;
	}

	/** The key a widget should display: the reader's key while it's the active source. */
	keyFor(id: string, usual: Key): Key {
		return this.source?.id === id && this.key ? this.key : usual;
	}

	async play(src: PlaySource, opts: { loop?: boolean; key?: Key } = {}) {
		const token = ++this.token;
		if (this.source?.id !== src.id) {
			this.key = src.usualKey;
			this.tempo = src.tempo;
		}
		if (opts.key) this.key = opts.key;
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
