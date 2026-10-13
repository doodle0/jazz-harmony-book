// Grooves turn a voiced progression into a band part: comping, bass and drums.
// One groove per style bucket (plan §2). They are pure functions, so they're
// testable without audio and can be rendered by the review page later.

import { bassMidi, type Voicing } from '#lib/theory/voicing.ts';
import { degreeInterval, pc, transpose } from '#lib/theory/pitch.ts';
import type { ResolvedChord } from '#lib/theory/progression.ts';
import type { DrumEv, Inst, NoteEv, Sequence, Style } from '../types';

export interface GrooveInput {
	chords: ResolvedChord[];
	voicings: Voicing[];
	beats: number;
	beatsPerBar: number;
	/** leave out the rhythm section, e.g. for A/B demos that should be "just the chords" */
	drums?: boolean;
	bass?: boolean;
	/** the comping instrument */
	comp?: Inst;
}

interface Groove {
	swing: number;
	comp: (g: GrooveInput) => NoteEv[];
	bass: (g: GrooveInput) => NoteEv[];
	drums: (g: GrooveInput) => DrumEv[];
	defaultComp?: Inst;
}

// ---- helpers --------------------------------------------------------------

const BASS_LOW = 31; // G1
const BASS_HIGH = 50; // D3

/** deterministic pseudo-random in [0,1) */
function rand(seed: number) {
	const x = Math.sin(seed * 9301 + 49297) * 233280;
	return x - Math.floor(x);
}

function chordAt(g: GrooveInput, beat: number): number {
	const b = ((beat % g.beats) + g.beats) % g.beats;
	let idx = 0;
	g.chords.forEach((c, i) => {
		if (c.start <= b + 1e-6) idx = i;
	});
	return idx;
}

function nearest(pcTarget: number, prev: number, low = BASS_LOW, high = BASS_HIGH): number {
	let best = low + ((pcTarget - low) % 12 + 12) % 12;
	for (let m = best; m <= high; m += 12) if (Math.abs(m - prev) < Math.abs(best - prev)) best = m;
	return best;
}

function tonePc(c: ResolvedChord, degree: string) {
	return pc(transpose(c.chord.root, degreeInterval(degree)));
}

function thirdOf(c: ResolvedChord) {
	const q = c.chord.quality;
	if (q === 'sus7' || q === 'sus') return '4';
	return ['min', 'min7', 'min6', 'minMaj7', 'halfDim7', 'dim7', 'dim'].includes(q) ? 'b3' : '3';
}

function fifthOf(c: ResolvedChord) {
	const q = c.chord.quality;
	if (q === 'halfDim7' || q === 'dim7' || q === 'dim') return 'b5';
	if (q === 'aug' || q === 'aug7' || q === 'maj7#5') return '#5';
	return '5';
}

function rootPc(c: ResolvedChord) {
	return pc(c.chord.bass ?? c.chord.root);
}

function comp(g: GrooveInput, beat: number, dur: number, vel: number, inst: Inst): NoteEv {
	const i = chordAt(g, beat);
	return { beat, dur, inst, midi: g.voicings[i].notes.map((n) => n.midi), vel };
}

/** Walking bass: root on the downbeat, chord tones in between, a chromatic approach into the next chord. */
function walkingBass(g: GrooveInput, vel = 0.8): NoteEv[] {
	const out: NoteEv[] = [];
	let prev = bassMidi(g.chords[0].chord, 36);
	g.chords.forEach((c, i) => {
		const next = g.chords[(i + 1) % g.chords.length];
		const n = Math.max(1, Math.round(c.beats));
		const root = nearest(rootPc(c), prev);
		const notes: number[] = [root];
		const up = rand(i + 1) > 0.4;
		const inner = up ? [thirdOf(c), fifthOf(c)] : [fifthOf(c), thirdOf(c)];
		let cur = root;
		for (let b = 1; b < n - 1; b++) {
			const deg = inner[(b - 1) % inner.length];
			cur = nearest(tonePc(c, deg), cur);
			notes.push(cur);
		}
		if (n >= 2) {
			const target = nearest(rootPc(next), cur);
			const approach = target + (cur > target ? 1 : -1) * (rand(i * 7) > 0.3 ? 1 : -1);
			notes.push(Math.min(BASS_HIGH, Math.max(BASS_LOW, approach)));
		}
		notes.forEach((m, b) => out.push({ beat: c.start + b, dur: 0.9, inst: 'bass', midi: [m], vel: b === 0 ? vel : vel * 0.85 }));
		prev = notes[notes.length - 1];
	});
	return out;
}

function rootFifthBass(g: GrooveInput, pattern: [number, 'R' | '5', number][], vel = 0.8): NoteEv[] {
	const out: NoteEv[] = [];
	let prev = 40;
	for (let bar = 0; bar * g.beatsPerBar < g.beats; bar++) {
		for (const [offset, which, dur] of pattern) {
			const beat = bar * g.beatsPerBar + offset;
			if (beat >= g.beats) continue;
			const c = g.chords[chordAt(g, beat)];
			const target = which === 'R' ? rootPc(c) : tonePc(c, fifthOf(c));
			const m = nearest(target, prev);
			out.push({ beat, dur, inst: 'bass', midi: [m], vel });
			prev = m;
		}
	}
	return out;
}

function perBar(g: GrooveInput, f: (barStart: number, bar: number) => DrumEv[]): DrumEv[] {
	const out: DrumEv[] = [];
	for (let bar = 0; bar * g.beatsPerBar < g.beats; bar++) out.push(...f(bar * g.beatsPerBar, bar));
	return out;
}

// ---- swing family --------------------------------------------------------

const CHARLESTON: number[][] = [[0, 1.5], [0, 2.5], [1.5, 3], [0.5, 2], [0, 3.5]];

function swingComp(g: GrooveInput, inst: Inst, sparse = false): NoteEv[] {
	const out: NoteEv[] = [];
	g.chords.forEach((c, i) => {
		if (c.beats >= 4) {
			const pat = sparse ? [CHARLESTON[0][rand(i) > 0.5 ? 0 : 1]] : CHARLESTON[Math.floor(rand(i + 3) * CHARLESTON.length)];
			pat.forEach((o, k) => out.push(comp(g, c.start + o, k === 0 ? 1.2 : 0.45, 0.55, inst)));
		} else {
			out.push(comp(g, c.start, Math.min(1.2, c.beats), 0.55, inst));
		}
	});
	return out;
}

function rideSwing(g: GrooveInput): DrumEv[] {
	return perBar(g, (s) => {
		const ev: DrumEv[] = [];
		for (let b = 0; b < g.beatsPerBar; b++) {
			ev.push({ beat: s + b, drum: 'ride', vel: b % 2 ? 0.55 : 0.42 });
			if (b % 2 === 1) ev.push({ beat: s + b + 0.5, drum: 'ride', vel: 0.32 });
			if (b % 2 === 1) ev.push({ beat: s + b, drum: 'hatFoot', vel: 0.5 });
		}
		return ev;
	});
}

const swing: Groove = {
	swing: 0.64,
	comp: (g) => swingComp(g, g.comp ?? 'piano'),
	bass: (g) => walkingBass(g),
	drums: rideSwing
};

const bebop: Groove = {
	...swing,
	swing: 0.6,
	comp: (g) => swingComp(g, g.comp ?? 'piano', true)
};

const hardBop: Groove = {
	...swing,
	swing: 0.66,
	drums: (g) => [
		...rideSwing(g),
		...perBar(g, (s) => [
			{ beat: s + 1, drum: 'snare', vel: 0.18 },
			{ beat: s + 3, drum: 'snare', vel: 0.22 }
		])
	]
};

// ---- ballad ---------------------------------------------------------------

const ballad: Groove = {
	swing: 0.66,
	comp: (g) =>
		g.chords.map((c, i) => ({
			beat: c.start,
			dur: c.beats,
			inst: g.comp ?? 'piano',
			midi: g.voicings[i].notes.map((n) => n.midi),
			vel: 0.45
		})),
	bass: (g) => rootFifthBass(g, [[0, 'R', 1.9], [2, '5', 1.9]], 0.7),
	drums: (g) =>
		perBar(g, (s) => {
			const ev: DrumEv[] = [];
			for (let b = 0; b < g.beatsPerBar; b++) ev.push({ beat: s + b, drum: 'brush', vel: 0.3 });
			ev.push({ beat: s + 1, drum: 'hatFoot', vel: 0.3 }, { beat: s + 3, drum: 'hatFoot', vel: 0.3 });
			return ev;
		})
};

// ---- waltz ------------------------------------------------------------------

const waltz: Groove = {
	swing: 0.64,
	comp: (g) => {
		const out: NoteEv[] = [];
		for (let bar = 0; bar * g.beatsPerBar < g.beats; bar++) {
			const s = bar * g.beatsPerBar;
			out.push(comp(g, s + 1, 0.8, 0.5, g.comp ?? 'piano'), comp(g, s + 2, 0.6, 0.42, g.comp ?? 'piano'));
		}
		return out;
	},
	bass: (g) => walkingBass(g),
	drums: (g) =>
		perBar(g, (s) => [
			{ beat: s, drum: 'ride', vel: 0.45 },
			{ beat: s + 1, drum: 'ride', vel: 0.5 },
			{ beat: s + 1.5, drum: 'ride', vel: 0.3 },
			{ beat: s + 2, drum: 'ride', vel: 0.45 },
			{ beat: s + 1, drum: 'hatFoot', vel: 0.35 },
			{ beat: s + 2, drum: 'hatFoot', vel: 0.35 }
		])
};

// ---- bossa / samba -------------------------------------------------------------

const BOSSA_HITS = [
	[0, 1.5, 3],
	[1, 2.5]
];

const bossa: Groove = {
	swing: 0.5,
	defaultComp: 'guitar',
	comp: (g) => {
		const out: NoteEv[] = [];
		for (let bar = 0; bar * g.beatsPerBar < g.beats; bar++) {
			for (const o of BOSSA_HITS[bar % 2]) {
				const beat = bar * g.beatsPerBar + o;
				if (beat < g.beats) out.push(comp(g, beat, 0.7, 0.55, g.comp ?? 'guitar'));
			}
		}
		return out;
	},
	bass: (g) => rootFifthBass(g, [[0, 'R', 1.4], [1.5, '5', 0.45], [2, '5', 1.4], [3.5, 'R', 0.45]], 0.75),
	drums: (g) =>
		perBar(g, (s, bar) => {
			const ev: DrumEv[] = [];
			for (let e = 0; e < 8; e++) ev.push({ beat: s + e / 2, drum: 'shaker', vel: e % 2 ? 0.3 : 0.18 });
			for (const o of BOSSA_HITS[bar % 2]) ev.push({ beat: s + o, drum: 'rim', vel: 0.35 });
			ev.push({ beat: s, drum: 'kick', vel: 0.35 }, { beat: s + 2, drum: 'kick', vel: 0.3 });
			return ev;
		})
};

const samba: Groove = {
	...bossa,
	drums: (g) =>
		perBar(g, (s) => {
			const ev: DrumEv[] = [];
			for (let e = 0; e < 16; e++) ev.push({ beat: s + e / 4, drum: 'shaker', vel: e % 4 === 3 ? 0.35 : 0.15 });
			ev.push({ beat: s, drum: 'kick', vel: 0.35 }, { beat: s + 1.75, drum: 'kick', vel: 0.3 }, { beat: s + 2, drum: 'kick', vel: 0.4 });
			ev.push({ beat: s + 0.5, drum: 'rim', vel: 0.3 }, { beat: s + 1.5, drum: 'rim', vel: 0.3 }, { beat: s + 3, drum: 'rim', vel: 0.3 });
			return ev;
		})
};

// ---- Afro-Cuban ---------------------------------------------------------------

const latin: Groove = {
	swing: 0.5,
	comp: (g) => {
		const out: NoteEv[] = [];
		// a light montuno: off-beat stabs
		for (let bar = 0; bar * g.beatsPerBar < g.beats; bar++) {
			for (const o of [0, 1.5, 2.5, 3.5]) {
				const beat = bar * g.beatsPerBar + o;
				if (beat < g.beats) out.push(comp(g, beat, 0.4, o === 0 ? 0.5 : 0.42, g.comp ?? 'piano'));
			}
		}
		return out;
	},
	// tumbao: "and of 2" and an anticipated root on 4
	bass: (g) => {
		const out: NoteEv[] = [];
		let prev = 40;
		for (let bar = 0; bar * g.beatsPerBar < g.beats; bar++) {
			const s = bar * g.beatsPerBar;
			const c = g.chords[chordAt(g, s)];
			const next = g.chords[chordAt(g, s + g.beatsPerBar)];
			const a = nearest(tonePc(c, fifthOf(c)), prev);
			const b = nearest(rootPc(next), a);
			out.push({ beat: s + 1.5, dur: 1.4, inst: 'bass', midi: [a], vel: 0.8 });
			out.push({ beat: s + 3, dur: 1.4, inst: 'bass', midi: [b], vel: 0.8 });
			prev = b;
		}
		return out;
	},
	drums: (g) =>
		perBar(g, (s, bar) => {
			const clave = bar % 2 === 0 ? [0, 1.5, 3] : [1, 2];
			const ev: DrumEv[] = clave.map((o) => ({ beat: s + o, drum: 'rim' as const, vel: 0.45 }));
			for (let b = 0; b < 4; b++) ev.push({ beat: s + b, drum: 'cowbell', vel: b === 0 ? 0.3 : 0.2 });
			ev.push({ beat: s + 3.5, drum: 'kick', vel: 0.3 });
			return ev;
		})
};

// ---- modal ---------------------------------------------------------------

const modal: Groove = {
	swing: 0.5,
	comp: (g) => {
		const out: NoteEv[] = [];
		g.chords.forEach((c, i) => {
			out.push(comp(g, c.start, Math.min(c.beats, 3.5), 0.45, g.comp ?? 'piano'));
			if (c.beats >= 4 && rand(i) > 0.4) out.push(comp(g, c.start + 2.5, 1.2, 0.38, g.comp ?? 'piano'));
		});
		return out;
	},
	bass: (g) => rootFifthBass(g, [[0, 'R', 1.4], [1.5, '5', 0.9], [3, 'R', 0.9]], 0.75),
	drums: (g) =>
		perBar(g, (s) => {
			const ev: DrumEv[] = [];
			for (let e = 0; e < 8; e++) ev.push({ beat: s + e / 2, drum: 'ride', vel: e % 2 ? 0.25 : 0.4 });
			ev.push({ beat: s + 1, drum: 'hatFoot', vel: 0.35 }, { beat: s + 3, drum: 'hatFoot', vel: 0.35 });
			return ev;
		})
};

// ---- pad (no band, just sustained chords) ---------------------------------------

const pad: Groove = {
	swing: 0.5,
	comp: (g) =>
		g.chords.map((c, i) => ({
			beat: c.start,
			dur: c.beats,
			inst: g.comp ?? 'piano',
			midi: g.voicings[i].notes.map((n) => n.midi),
			vel: 0.5
		})),
	bass: (g) => g.chords.map((c) => ({ beat: c.start, dur: c.beats, inst: 'bass' as const, midi: [bassMidi(c.chord, 36)], vel: 0.6 })),
	drums: () => []
};

export const GROOVES: Record<Style, Groove> = {
	swing,
	bebop,
	'hard-bop': hardBop,
	blues: hardBop,
	ballad,
	waltz,
	bossa,
	samba,
	latin,
	modal,
	pad
};

export const METER: Partial<Record<Style, number>> = { waltz: 3 };

export function renderGroove(style: Style, g: GrooveInput): Sequence {
	const groove = GROOVES[style];
	const input = { ...g, comp: g.comp ?? groove.defaultComp };
	return {
		beats: g.beats,
		beatsPerBar: g.beatsPerBar,
		swing: groove.swing,
		notes: [...groove.comp(input), ...(g.bass === false ? [] : groove.bass(input))],
		drums: g.drums === false ? [] : groove.drums(input),
		marks: g.chords.map((c, i) => ({ beat: c.start, index: i }))
	};
}
