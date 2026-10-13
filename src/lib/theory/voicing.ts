// Piano voicings. A voicing form is a bottom-up list of slots ('3', '7', '9', '13|5' …)
// that resolve against a chord's quality and tensions. Placement then picks the octave
// that moves least from the previous chord, so a ii-V-I in A/B forms comes out the way
// the guide prints it: D-9 (F A C E) → G13 (F A B E) → CΔ9 (E G B D).

import { CHORD_TONES, type Chord, type Quality } from './chord';
import { degreeInterval, pc, transpose, type Pitch } from './pitch';

export type VoicingStyle = 'shell' | 'rootless' | 'A' | 'B' | 'alternate' | 'close' | 'triad';

export interface VoicedNote {
	midi: number;
	pitch: Pitch;
	/** degree token relative to the chord root, e.g. '3', 'b7', '9' */
	degree: string;
}

export interface Voicing {
	notes: VoicedNote[];
	form?: 'A' | 'B';
}

export interface VoiceOptions {
	/** ø7 ninth: omitted (default, the guide's voicing), ♭9 (textbook, an avoid note) or ♮9 */
	halfDimNinth?: 'none' | 'b9' | '9';
	/** First form for 'alternate' (the guide's minor ii-V-i starts on B) */
	startForm?: 'A' | 'B';
	/** Window for the lowest note of the voicing */
	low?: number;
	high?: number;
}

const has = (c: Chord, t: string) => c.tensions.includes(t);

/** Which ninth / thirteenth / fifth a chord should use in a voicing slot. */
function slot(c: Chord, s: string, opts: VoiceOptions): string | null {
	const tones = CHORD_TONES[c.quality];
	switch (s) {
		case '1':
			return '1';
		case '3':
			return tones.find((t) => /^(b?3|4)$/.test(t)) ?? '3';
		case '5':
			if (has(c, 'b5')) return 'b5';
			if (has(c, '#5')) return '#5';
			return tones.find((t) => /^[b#]?5$/.test(t)) ?? '5';
		case '7': {
			const t = tones.find((t) => /^(b{0,2}7|6)$/.test(t));
			return t ?? null;
		}
		case '9': {
			if (c.quality === 'halfDim7') {
				const n = opts.halfDimNinth ?? 'none';
				return n === 'none' ? null : n;
			}
			if (has(c, 'b9')) return 'b9';
			if (has(c, '#9')) return '#9';
			if (c.quality === 'dim7') return null;
			return '9';
		}
		case '#9':
			return has(c, '#9') ? '#9' : slot(c, '9', opts);
		case '13': {
			if (has(c, 'b13')) return 'b13';
			if (has(c, '13') || c.quality === 'dom7' || c.quality === 'sus7') return '13';
			return slot(c, '5', opts);
		}
		case '11':
			return has(c, '#11') ? '#11' : '11';
		default:
			return s;
	}
}

/** Bottom-up slot lists for each form. */
function forms(q: Quality): { A: string[]; B: string[] } {
	switch (q) {
		case 'dom7':
		case 'aug7':
			return { A: ['3', '13', '7', '9'], B: ['7', '9', '3', '13'] };
		case 'alt7':
			return { A: ['3', '13', '7', '#9'], B: ['7', '9', '3', '13'] };
		case 'sus7':
			return { A: ['3', '13', '7', '9'], B: ['7', '9', '3', '13'] };
		case 'halfDim7':
			return { A: ['3', '5', '7', '9'], B: ['7', '9', '3', '5'] };
		case 'dim7':
			return { A: ['1', '3', '5', '7'], B: ['5', '7', '1', '3'] };
		case 'maj':
		case 'min':
		case 'dim':
		case 'aug':
		case 'sus':
			return { A: ['3', '5', '1'], B: ['5', '1', '3'] };
		default:
			return { A: ['3', '5', '7', '9'], B: ['7', '9', '3', '5'] };
	}
}

function slotsFor(c: Chord, style: VoicingStyle, form: 'A' | 'B'): string[] {
	switch (style) {
		case 'shell':
			return form === 'A' ? ['1', '3', '7'] : ['1', '7', '3'];
		case 'close':
			return CHORD_TONES[c.quality].length === 3 ? ['1', '3', '5'] : ['1', '3', '5', '7'];
		case 'triad':
			return ['1', '3', '5'];
		default:
			return forms(c.quality)[form];
	}
}

/** Resolve slots to degrees (dropping empty ones) and stack them upwards from `bottom`. */
function stack(c: Chord, slots: string[], bottom: number, opts: VoiceOptions): VoicedNote[] {
	const degrees = slots.map((s) => slot(c, s, opts)).filter((d): d is string => !!d);
	const out: VoicedNote[] = [];
	let floor = bottom;
	for (const [i, d] of degrees.entries()) {
		const p = transpose(c.root, degreeInterval(d));
		let midi = floor + ((pc(p) - floor) % 12 + 12) % 12;
		if (i > 0 && midi <= out[i - 1].midi) midi += 12;
		out.push({ midi, pitch: p, degree: d });
		floor = midi;
	}
	return out;
}

/** All placements of a form whose lowest note lies in [low, high]. */
function placements(c: Chord, slots: string[], opts: VoiceOptions): VoicedNote[][] {
	const low = opts.low ?? 48;
	const high = opts.high ?? 62;
	const out: VoicedNote[][] = [];
	for (let b = low; b <= high; b++) {
		const v = stack(c, slots, b, opts);
		if (v.length && v[0].midi === b) out.push(v);
	}
	return out;
}

function distance(a: VoicedNote[], b: VoicedNote[]): number {
	const x = a.map((n) => n.midi);
	const y = b.map((n) => n.midi);
	const n = Math.max(x.length, y.length);
	let d = 0;
	for (let i = 0; i < n; i++) d += Math.abs((x[Math.min(i, x.length - 1)] ?? 0) - (y[Math.min(i, y.length - 1)] ?? 0));
	// keep the overall register steady too
	const avg = (v: number[]) => v.reduce((s, m) => s + m, 0) / v.length;
	return d + Math.abs(avg(x) - avg(y));
}

/**
 * Voices a progression. 'A' / 'B' fix the form, 'alternate' goes A-B-A…, 'rootless'
 * picks whichever form moves least, 'shell' / 'close' / 'triad' use those shapes.
 */
export function voiceProgression(chords: Chord[], style: VoicingStyle, opts: VoiceOptions = {}): Voicing[] {
	const out: Voicing[] = [];
	let prev: VoicedNote[] | null = null;
	const center = ((opts.low ?? 48) + (opts.high ?? 62)) / 2;
	chords.forEach((c, i) => {
		let candidateForms: ('A' | 'B')[];
		if (style === 'A' || style === 'B') candidateForms = [style];
		else if (style === 'alternate') {
			const first = opts.startForm ?? 'A';
			const other = first === 'A' ? 'B' : 'A';
			candidateForms = [i % 2 === 0 ? first : other];
		}
		else candidateForms = ['A', 'B'];
		let best: { v: VoicedNote[]; form: 'A' | 'B'; score: number } | null = null;
		for (const form of candidateForms) {
			for (const v of placements(c, slotsFor(c, style, form), opts)) {
				const score = prev ? distance(prev, v) : Math.abs(v[0].midi - center) + (form === 'A' ? 0 : 0.5);
				if (!best || score < best.score) best = { v, form, score };
			}
		}
		if (!best) throw new Error('No voicing found');
		out.push({ notes: best.v, form: best.form });
		prev = best.v;
	});
	return out;
}

export function voiceChord(c: Chord, style: VoicingStyle, opts: VoiceOptions = {}): Voicing {
	return voiceProgression([c], style, opts)[0];
}

/** Bass note for a chord (its slash bass or root) in the bass register. */
export function bassMidi(c: Chord, low = 36): number {
	const p = c.bass ?? c.root;
	return low + ((pc(p) - low) % 12 + 12) % 12;
}
