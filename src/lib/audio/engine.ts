// The audio engine. Loaded lazily (dynamic import) on the first play tap.
// smplr plays the sampled instruments; a small lookahead scheduler places events
// on the AudioContext clock, handles loop, tempo changes and swing.

import { Soundfont } from 'smplr';
import { playDrum } from './drums';
import type { Inst, Sequence } from './types';

type SoundfontInstance = ReturnType<typeof Soundfont>;

const INSTRUMENTS: Record<Inst, { name: string; volume: number }> = {
	piano: { name: 'acoustic_grand_piano', volume: 95 },
	bass: { name: 'acoustic_bass', volume: 110 },
	guitar: { name: 'acoustic_guitar_nylon', volume: 105 },
	vibes: { name: 'vibraphone', volume: 90 }
};

const LOOKAHEAD = 0.15; // seconds scheduled ahead
const TICK = 25; // ms between scheduler runs

export interface PlayOptions {
	tempo: number;
	loop: boolean;
	onMark?: (index: number) => void;
	onBeat?: (beat: number) => void;
	onEnd?: () => void;
}

interface Flat {
	beat: number;
	run: (time: number, spb: number) => void;
	mark?: number;
}

export class Engine {
	readonly ctx: AudioContext;
	private master: GainNode;
	private drumBus: GainNode;
	private insts = new Map<Inst, Promise<SoundfontInstance>>();
	private loaded = new Map<Inst, SoundfontInstance>();

	private timer: ReturnType<typeof setInterval> | null = null;
	private events: Flat[] = [];
	private length = 0;
	private loop = true;
	private anchorTime = 0;
	private anchorBeat = 0;
	private spb = 0.5;
	private cursor = 0; // absolute beat already scheduled up to
	private idx = 0;
	private lap = 0;
	private opts: PlayOptions | null = null;
	private uiTimers: ReturnType<typeof setTimeout>[] = [];

	constructor() {
		this.ctx = new AudioContext({ latencyHint: 'interactive' });
		this.master = this.ctx.createGain();
		this.master.gain.value = 0.8;
		const comp = this.ctx.createDynamicsCompressor();
		comp.threshold.value = -14;
		comp.ratio.value = 3;
		this.master.connect(comp);
		comp.connect(this.ctx.destination);
		this.drumBus = this.ctx.createGain();
		this.drumBus.gain.value = 0.9;
		this.drumBus.connect(this.master);
	}

	async resume() {
		if (this.ctx.state !== 'running') await this.ctx.resume();
	}

	setVolume(v: number) {
		this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.02);
	}

	load(inst: Inst): Promise<SoundfontInstance> {
		let p = this.insts.get(inst);
		if (!p) {
			const def = INSTRUMENTS[inst];
			const sf = Soundfont(this.ctx, { instrument: def.name, kit: 'MusyngKite', destination: this.master, volume: def.volume });
			p = sf.ready.then(() => {
				this.loaded.set(inst, sf);
				return sf;
			});
			p.catch(() => this.insts.delete(inst));
			this.insts.set(inst, p);
		}
		return p;
	}

	isLoaded(inst: Inst) {
		return this.loaded.has(inst);
	}

	async loadFor(seq: Sequence) {
		const needed = new Set(seq.notes.map((n) => n.inst));
		await Promise.all([...needed].map((i) => this.load(i)));
	}

	/** Play notes right now (taps on keys, single chords). */
	playNow(inst: Inst, midi: number[], dur = 1.2, vel = 0.7, delay = 0) {
		const sf = this.loaded.get(inst);
		if (!sf) {
			this.load(inst).then(() => this.playNow(inst, midi, dur, vel));
			return;
		}
		const t = this.ctx.currentTime + 0.01 + delay;
		for (const m of midi) sf.start({ note: m, time: t, duration: dur, velocity: Math.round(vel * 127) });
	}

	// ---- transport ----------------------------------------------------------

	play(seq: Sequence, opts: PlayOptions) {
		this.stop();
		this.opts = opts;
		this.loop = opts.loop;
		this.length = seq.beats;
		this.spb = 60 / opts.tempo;
		this.events = this.flatten(seq);
		this.anchorTime = this.ctx.currentTime + 0.06;
		this.anchorBeat = 0;
		this.cursor = 0;
		this.idx = 0;
		this.lap = 0;
		this.timer = setInterval(() => this.tick(), TICK);
		this.tick();
	}

	/** Swap in a new sequence (e.g. transposed) without restarting the clock. */
	replace(seq: Sequence) {
		if (!this.timer || !this.opts) return;
		this.events = this.flatten(seq);
		this.length = seq.beats;
		// continue from the current position within the bar structure
		const lapStart = this.lap * this.length;
		const pos = this.cursor - lapStart;
		this.idx = this.events.findIndex((e) => e.beat >= pos - 1e-6);
		if (this.idx < 0) this.idx = this.events.length;
		this.stopVoices();
	}

	setTempo(bpm: number) {
		const now = this.ctx.currentTime;
		const beatNow = this.beatAt(now);
		this.anchorTime = now;
		this.anchorBeat = beatNow;
		this.spb = 60 / bpm;
	}

	stop() {
		if (this.timer) clearInterval(this.timer);
		this.timer = null;
		this.uiTimers.forEach(clearTimeout);
		this.uiTimers = [];
		this.stopVoices();
	}

	stopVoices() {
		for (const sf of this.loaded.values()) sf.stop();
	}

	get playing() {
		return this.timer !== null;
	}

	private beatAt(time: number) {
		return this.anchorBeat + (time - this.anchorTime) / this.spb;
	}

	private timeAt(beat: number) {
		return this.anchorTime + (beat - this.anchorBeat) * this.spb;
	}

	private flatten(seq: Sequence): Flat[] {
		const swing = (b: number) => {
			const whole = Math.floor(b + 1e-6);
			const frac = b - whole;
			return Math.abs(frac - 0.5) < 0.01 ? whole + seq.swing : b;
		};
		const out: Flat[] = [];
		for (const n of seq.notes) {
			const inst = n.inst;
			out.push({
				beat: swing(n.beat),
				run: (time, spb) => {
					const sf = this.loaded.get(inst);
					if (!sf) return;
					for (const m of n.midi)
						sf.start({ note: m, time, duration: n.dur * spb, velocity: Math.round(n.vel * 127) });
				}
			});
		}
		for (const d of seq.drums) {
			out.push({ beat: swing(d.beat), run: (time) => playDrum(this.ctx, this.drumBus, d.drum, time, d.vel) });
		}
		for (const m of seq.marks) out.push({ beat: m.beat, run: () => {}, mark: m.index });
		return out.sort((a, b) => a.beat - b.beat);
	}

	private tick() {
		const horizon = this.beatAt(this.ctx.currentTime + LOOKAHEAD);
		if (!this.events.length || this.length <= 0) return;
		while (this.timer) {
			if (this.idx >= this.events.length) {
				if (!this.loop) {
					const endTime = this.timeAt(this.length);
					const t = setTimeout(() => {
						this.stop();
						this.opts?.onEnd?.();
					}, Math.max(0, (endTime - this.ctx.currentTime) * 1000));
					this.uiTimers.push(t);
					clearInterval(this.timer);
					this.timer = null;
					return;
				}
				this.lap++;
				this.idx = 0;
				continue;
			}
			const ev = this.events[this.idx];
			const abs = this.lap * this.length + ev.beat;
			if (abs > horizon) break;
			const time = Math.max(this.timeAt(abs), this.ctx.currentTime);
			ev.run(time, this.spb);
			if (ev.mark !== undefined && this.opts?.onMark) {
				const cb = this.opts.onMark;
				const mark = ev.mark;
				this.uiTimers.push(setTimeout(() => cb(mark), Math.max(0, (time - this.ctx.currentTime) * 1000)));
			}
			this.cursor = abs;
			this.idx++;
		}
		// trim finished UI timers occasionally
		if (this.uiTimers.length > 200) this.uiTimers = this.uiTimers.slice(-50);
	}
}

let engine: Engine | null = null;

export function getEngine(): Engine {
	engine ??= new Engine();
	return engine;
}
