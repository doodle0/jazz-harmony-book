// Piano voicings. A voicing form is a bottom-up list of slots ('3', '7', '9', '13|5' …)
// that resolve against a chord's quality and tensions. Placement then picks the octaves
// that move least over the whole progression, so a ii-V-I in A/B forms comes out the way
// the guide prints it: D-9 (F A C E) → G13 (F A B E) → CΔ9 (E G B D).

import { CHORD_TONES, type Chord, type Quality } from './chord';
import { degreeInterval, pc, transpose, type Pitch } from './pitch';

export type VoicingStyle = 'shell' | 'rootless' | 'A' | 'B' | 'alternate' | 'close' | 'smooth' | 'drop2' | 'triad' | 'spread';

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
	/** For 'A' / 'B' / 'alternate' / 'rootless': four-note rootless forms (default), or
	 *  root-position shells, where A = 1-3-7 and B = 1-7-3 */
	family?: 'rootless' | 'shell';
	/** Window for the lowest note of the voicing (for 'spread', of the left hand) */
	low?: number;
	high?: number;
	/** 'spread': highest note the right hand may reach */
	top?: number;
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
			// a plain 7sus keeps its root on top instead of an unwritten 9th
			if (c.quality === 'sus7' && !has(c, '9')) return '1';
			return '9';
		}
		case '#9':
			return has(c, '#9') ? '#9' : slot(c, '9', opts);
		case '13': {
			if (has(c, 'b13')) return 'b13';
			if (has(c, '13')) return '13';
			// an altered fifth takes the 13th's place (D7(♭5): F♯ A♭ C E)
			if (c.quality === 'dom7' && (has(c, 'b5') || has(c, '#5'))) return slot(c, '5', opts);
			if (c.quality === 'dom7') return '13';
			return slot(c, '5', opts);
		}
		case '13|5':
			// the fifth of a rootless Δ7 / -7 gives way to a written colour tone:
			// CΔ7(♯11) → E F♯ B D, C-7(11) → E♭ F B♭ D, C-7(13) → E♭ A B♭ D
			if (c.quality === 'maj7' && has(c, '#11')) return '#11';
			if (c.quality === 'maj7' && has(c, '13')) return '13';
			if (c.quality === 'min7' || c.quality === 'minMaj7') {
				for (const t of ['11', '13', 'b13']) if (has(c, t)) return t;
			}
			return slot(c, '5', opts);
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
			return { A: ['3', '13|5', '7', '9'], B: ['7', '9', '3', '13|5'] };
	}
}

/** Styles built from the chord tones alone (no added colour tones). */
const CHORD_TONE_STYLES: VoicingStyle[] = ['close', 'smooth', 'drop2', 'triad'];

function slotsFor(c: Chord, style: VoicingStyle, form: 'A' | 'B', opts: VoiceOptions = {}): string[] {
	if (opts.family === 'shell' && !CHORD_TONE_STYLES.includes(style)) style = 'shell';
	switch (style) {
		case 'shell':
			return form === 'A' ? ['1', '3', '7'] : ['1', '7', '3'];
		case 'close':
		case 'smooth':
		case 'drop2':
			// 7alt has no 5th among its chord tones but still needs its ♭7
			return CHORD_TONES[c.quality].some((t) => /[67]/.test(t)) ? ['1', '3', '5', '7'] : ['1', '3', '5'];
		case 'triad':
			return ['1', '3', '5'];
		default:
			return forms(c.quality)[form];
	}
}

/**
 * Resolve slots to degrees (dropping empty ones). Rootless forms then add any written
 * tension the form has no room for on top, so G7(♯11) keeps its ♯11. 7alt already
 * implies its tensions, and the ø7 ninth follows the halfDimNinth option.
 */
function degreesFor(c: Chord, style: VoicingStyle, form: 'A' | 'B', opts: VoiceOptions): string[] {
	const degrees = slotsFor(c, style, form, opts)
		.map((s) => slot(c, s, opts))
		.filter((d): d is string => !!d);
	if (style === 'shell' || CHORD_TONE_STYLES.includes(style) || opts.family === 'shell' || c.quality === 'alt7') return degrees;
	const semis = (d: string) => degreeInterval(d).semis;
	for (const t of c.tensions) {
		if (c.quality === 'halfDim7' && /9$/.test(t)) continue;
		if (!degrees.some((d) => semis(d) === semis(t))) degrees.push(t);
	}
	return degrees;
}

/** Stack degrees upwards from `bottom`. */
function stack(c: Chord, degrees: string[], bottom: number): VoicedNote[] {
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
function placements(c: Chord, degrees: string[], low: number, high: number): VoicedNote[][] {
	const out: VoicedNote[][] = [];
	for (let b = low; b <= high; b++) {
		const v = stack(c, degrees, b);
		if (v.length && v[0].midi === b) out.push(v);
	}
	return out;
}

// ---- two-hand spread voicings ----------------------------------------------------

const SPREAD_LH = { low: 45, high: 57 };
const SPREAD_TOP = 79; // G5
const SPREAD_TOP_TARGET = 74;

/** Right-hand "pretty" notes for a spread voicing (the left hand plays 3 and 7). */
function prettyDegrees(c: Chord, opts: VoiceOptions): string[] {
	switch (c.quality) {
		case 'dom7':
		case 'aug7':
		case 'sus7':
			return ['9', '13'];
		case 'alt7':
			return ['#9', 'b13'];
		case 'halfDim7': {
			// ♭5 is what makes it ø7; the 11 would sit a half step from it, so the root goes on top instead
			const n = opts.halfDimNinth ?? 'none';
			return n === 'none' ? ['5', '1'] : ['5', n];
		}
		case 'dim7':
			return ['5', '1'];
		case 'maj':
		case 'min':
		case 'dim':
		case 'aug':
		case 'sus':
			return ['3', '5', '1'];
		default:
			return ['9', '13|5'];
	}
}

function* permutations<T>(xs: T[]): Generator<T[]> {
	if (xs.length <= 1) {
		yield xs;
		return;
	}
	for (let i = 0; i < xs.length; i++) for (const rest of permutations([...xs.slice(0, i), ...xs.slice(i + 1)])) yield [xs[i], ...rest];
}

/**
 * Root-shell-pretty: the bass has the root, the left hand the shell (3 and 7, in either
 * order) around C3–A3, the right hand the colour tones (9, 13 or 5, written tensions)
 * within an octave above it. Spread over two hands, the low register keeps wide intervals.
 */
function spreadCandidates(c: Chord, opts: VoiceOptions): VoicedNote[][] {
	const semis = (d: string) => degreeInterval(d).semis % 12;
	const g3 = slot(c, '3', opts)!;
	const g7 = slot(c, '7', opts);
	const lhShapes = g7 ? [[g3, g7], [g7, g3]] : [['1', '5']];
	const lhDegrees = lhShapes[0];
	const rh: string[] = [];
	const add = (d: string | null) => {
		if (d && ![...lhDegrees, ...rh].some((x) => semis(x) === semis(d))) rh.push(d);
	};
	// 7alt's tensions are implied, not written, so its degrees go in as they are
	for (const s of prettyDegrees(c, opts)) add(c.quality === 'alt7' ? s : slot(c, s, opts));
	if (c.quality !== 'alt7') for (const t of c.tensions) if (!(c.quality === 'halfDim7' && /9$/.test(t))) add(t);

	const out: VoicedNote[][] = [];
	const low = opts.low ?? SPREAD_LH.low;
	const high = opts.high ?? SPREAD_LH.high;
	const top = opts.top ?? SPREAD_TOP;
	for (const lh of lhShapes.flatMap((d) => placements(c, d, low, high))) {
		const lhTop = lh[lh.length - 1].midi;
		for (const order of permutations(rh)) {
			for (const v of placements(c, order, lhTop + 1, lhTop + 12)) {
				if (v[v.length - 1].midi > top || v[v.length - 1].midi - v[0].midi > 12) continue;
				out.push([...lh, ...v]);
			}
		}
	}
	return out;
}

// ---- choosing among placements -------------------------------------------------

/** Lowest comfortable bottom note for each interval in semitones ("low interval limits"). */
const LOW_LIMIT = [0, 52, 51, 48, 46, 45, 46, 34, 43, 41, 41, 41];

/** How far adjacent notes sit below their low interval limits: small intervals down low turn to mud. */
function mud(v: VoicedNote[]): number {
	let p = 0;
	for (let i = 1; i < v.length; i++) {
		const lo = v[i - 1].midi;
		const iv = v[i].midi - lo;
		if (iv < 12 && lo < LOW_LIMIT[iv]) p += LOW_LIMIT[iv] - lo;
	}
	return p;
}

const avg = (v: number[]) => v.reduce((s, m) => s + m, 0) / v.length;

/**
 * Voice-leading distance. Voices pair up in order when the counts match (the root of a
 * shell voicing counts for less: it's a bass note, not a line); otherwise each note goes
 * to the nearest note of the other chord, and the top voice counts once more.
 */
function distance(a: VoicedNote[], b: VoicedNote[], rootWeight = 1): number {
	const x = a.map((n) => n.midi);
	const y = b.map((n) => n.midi);
	let d = 0;
	if (x.length === y.length) {
		x.forEach((m, i) => (d += Math.abs(m - y[i]) * (i === 0 ? rootWeight : 1)));
	} else {
		const near = (m: number, to: number[]) => Math.min(...to.map((t) => Math.abs(t - m)));
		d = (x.reduce((s, m) => s + near(m, y), 0) + y.reduce((s, m) => s + near(m, x), 0)) / 2;
		d += Math.abs(x[x.length - 1] - y[y.length - 1]);
	}
	// keep the overall register steady too
	return d + Math.abs(avg(x) - avg(y));
}

interface Candidate {
	v: VoicedNote[];
	form: 'A' | 'B';
	/** cost of the voicing on its own: register and low-register mud */
	own: number;
}

/**
 * Voices a progression. 'A' / 'B' fix the form, 'alternate' goes A-B-A…, 'rootless'
 * picks whichever form moves least, 'shell' / 'close' / 'triad' use those shapes,
 * 'smooth' is close position in whichever inversion moves least, 'drop2' is a close
 * inversion with the second voice from the top an octave down, and 'spread' is a
 * two-hand root-shell-pretty voicing without the root (the bass plays it).
 *
 * The whole progression is voiced at once (a shortest path through every chord's
 * placements), so the first chord is chosen with the rest in view: a guide-tone line
 * that drifts down by step through a ii-V-I starts high enough to stay smooth, in any key.
 */
export function voiceProgression(chords: Chord[], style: VoicingStyle, opts: VoiceOptions = {}): Voicing[] {
	const spread = style === 'spread' && opts.family !== 'shell';
	const shell = style === 'shell' || (opts.family === 'shell' && !CHORD_TONE_STYLES.includes(style));
	const low = opts.low ?? 48;
	const high = opts.high ?? 62;
	const center = (low + high) / 2;
	// 'alternate' switches form on each new chord; a repeated bar keeps its voicing
	let turn = -1;
	const layers: Candidate[][] = chords.map((c, i) => {
		if (i === 0 || JSON.stringify(c) !== JSON.stringify(chords[i - 1])) turn++;
		if (spread) {
			return spreadCandidates(c, opts).map((v) => ({
				v,
				form: 'A' as const,
				own: 1.5 * mud(v) + 0.3 * Math.max(0, Math.abs(v[0].midi - (SPREAD_LH.low + SPREAD_LH.high) / 2) - 4) + 0.3 * Math.max(0, Math.abs(v[v.length - 1].midi - SPREAD_TOP_TARGET) - 3)
			}));
		}
		let forms: ('A' | 'B')[];
		if (style === 'A' || style === 'B') forms = [style];
		else if (style === 'alternate') {
			const first = opts.startForm ?? 'A';
			const other = first === 'A' ? 'B' : 'A';
			forms = [turn % 2 === 0 ? first : other];
		} else forms = ['A', 'B'];
		return forms.flatMap((form) => {
			const base = degreesFor(c, style, form, opts);
			// 'smooth': chord tones in any inversion, so each voice moves as little as it can.
			// 'drop2': each close inversion with its second voice from the top dropped an octave
			const inversions = base.map((_, r) => [...base.slice(r), ...base.slice(0, r)]);
			const shapes =
				style === 'smooth'
					? inversions
					: style === 'drop2' && base.length === 4
						? inversions.map(([a, b, c, d]) => [c, a, b, d])
						: [base];
			return shapes
				.flatMap((d) => placements(c, d, low, high))
				.map((v) => ({
					v,
					form,
					own: 1.5 * mud(v) + 0.3 * Math.max(0, Math.abs(v[0].midi - center) - 4) + (i === 0 && form === 'B' ? 0.5 : 0)
				}));
		});
	});
	layers.forEach((l, i) => {
		if (!l.length) throw new Error(`No voicing found for chord ${i + 1}`);
	});

	// shortest path: cost[i][k] = own + min over j of cost[i-1][j] + distance(j, k)
	const rootWeight = shell ? 0.25 : 1;
	let cost = layers[0].map((c) => c.own);
	const back: number[][] = [[]];
	for (let i = 1; i < layers.length; i++) {
		const prev = layers[i - 1];
		const next: number[] = [];
		const from: number[] = [];
		for (const cand of layers[i]) {
			let best = Infinity;
			let arg = 0;
			prev.forEach((p, j) => {
				const s = cost[j] + distance(p.v, cand.v, rootWeight);
				if (s < best) [best, arg] = [s, j];
			});
			next.push(best + cand.own);
			from.push(arg);
		}
		cost = next;
		back.push(from);
	}
	let k = cost.indexOf(Math.min(...cost));
	const out: Voicing[] = [];
	for (let i = layers.length - 1; i >= 0; i--) {
		const c = layers[i][k];
		out.unshift(spread ? { notes: c.v } : { notes: c.v, form: c.form });
		k = back[i][k];
	}
	return out;
}

/**
 * A fixed stack of degrees from the bass register up, each note the nearest one above
 * the last: '1 5 9 13 3 7 ♯11' is the Lydian chord as stacked fifths.
 */
export function voiceStack(c: Chord, degrees: string[], low = 36): Voicing {
	const bottom = low + ((pc(transpose(c.root, degreeInterval(degrees[0]))) - low) % 12 + 12) % 12;
	return { notes: stack(c, degrees, bottom) };
}

export function voiceChord(c: Chord, style: VoicingStyle, opts: VoiceOptions = {}): Voicing {
	return voiceProgression([c], style, opts)[0];
}

/** Bass note for a chord (its slash bass or root) in the bass register. */
export function bassMidi(c: Chord, low = 36): number {
	const p = c.bass ?? c.root;
	return low + ((pc(p) - low) % 12 + 12) % 12;
}

/**
 * A shape stacked inside a scale: from scale step `start`, go up `steps` scale steps at a
 * time. Diatonic planing moves the same step pattern to another start, so the intervals
 * follow the mode: [3, 3, 3] is a stack of fourths, [3, 3, 3, 2] the So What shape
 * (on D Dorian from D: D G C F A).
 */
export function scaleStack(root: Pitch, scaleDegrees: string[], start: number, steps: number[], low = 50): VoicedNote[] {
	const n = scaleDegrees.length;
	const idx = [start];
	for (const s of steps) idx.push(idx[idx.length - 1] + s);
	const out: VoicedNote[] = [];
	for (const i of idx) {
		const degree = scaleDegrees[((i % n) + n) % n];
		const p = transpose(root, degreeInterval(degree));
		const floor = out.length ? out[out.length - 1].midi + 1 : low;
		out.push({ midi: floor + ((pc(p) - floor) % 12 + 12) % 12, pitch: p, degree });
	}
	return out;
}
