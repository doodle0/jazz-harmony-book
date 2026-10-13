// Spelled pitches and intervals. Every note keeps its letter, so transposing
// E♭ by a major 3rd gives G (not F𝄪) and B♭ up a minor 3rd gives D♭ (not C♯).

export interface Pitch {
	/** 0..6 = C D E F G A B */
	step: number;
	/** -2..2 accidentals */
	alt: number;
}

export interface Interval {
	/** letter steps, 0..6 */
	steps: number;
	/** semitones, 0..11 */
	semis: number;
}

const LETTERS = 'CDEFGAB';
const NATURAL = [0, 2, 4, 5, 7, 9, 11];

const mod = (n: number, m: number) => ((n % m) + m) % m;

const ACC: Record<string, number> = { '♭': -1, b: -1, '♯': 1, '#': 1, '𝄫': -2, '𝄪': 2 };

/** Parses 'C', 'E♭', 'Eb', 'F#', 'B♭♭'. Returns null when not a note name. */
export function parsePitch(name: string): Pitch | null {
	const m = /^([A-Ga-g])([♭♯b#𝄫𝄪]*)$/u.exec(name.trim());
	if (!m) return null;
	let alt = 0;
	for (const ch of m[2]) alt += ACC[ch];
	return { step: LETTERS.indexOf(m[1].toUpperCase()), alt };
}

export function pitch(name: string): Pitch {
	const p = parsePitch(name);
	if (!p) throw new Error(`Not a note name: ${name}`);
	return p;
}

/** Pitch class 0..11 */
export function pc(p: Pitch): number {
	return mod(NATURAL[p.step] + p.alt, 12);
}

export function accidental(alt: number): string {
	if (alt === 0) return '';
	if (alt === 2) return '𝄪';
	if (alt === -2) return '𝄫';
	return alt > 0 ? '♯'.repeat(alt) : '♭'.repeat(-alt);
}

/** Display name in the lecture's notation: letters with ♯/♭. */
export function noteName(p: Pitch): string {
	return LETTERS[p.step] + accidental(p.alt);
}

export function transpose(p: Pitch, iv: Interval): Pitch {
	const step = mod(p.step + iv.steps, 7);
	const target = pc(p) + iv.semis;
	let alt = mod(target - NATURAL[step], 12);
	if (alt > 6) alt -= 12;
	return { step, alt };
}

export function interval(from: Pitch, to: Pitch): Interval {
	return { steps: mod(to.step - from.step, 7), semis: mod(pc(to) - pc(from), 12) };
}

export function invert(iv: Interval): Interval {
	return { steps: mod(-iv.steps, 7), semis: mod(-iv.semis, 12) };
}

/** Respell double accidentals (and optionally E♯/B♯/C♭/F♭) to the plainer enharmonic. */
export function simplify(p: Pitch, strict = false): Pitch {
	const odd = Math.abs(p.alt) === 1 && ['E♯', 'B♯', 'C♭', 'F♭'].includes(noteName(p));
	if (Math.abs(p.alt) < 2 && !(strict && odd)) return p;
	const target = pc(p);
	const nat = NATURAL.indexOf(target);
	if (nat >= 0) return { step: nat, alt: 0 };
	const dir = Math.sign(p.alt);
	return { step: NATURAL.indexOf(mod(target - dir, 12)), alt: dir };
}

export function samePitch(a: Pitch, b: Pitch) {
	return a.step === b.step && a.alt === b.alt;
}

// ---- scale degrees ------------------------------------------------------

/**
 * Degree token → interval. Tokens: '1', '♭2', 'b3', '#4', '♯11', 'bb7', '13'.
 * Numbers above 7 fold into the octave (9 → 2, 11 → 4, 13 → 6).
 */
export function degreeInterval(token: string): Interval {
	const m = /^([♭♯b#]*)(\d+)$/u.exec(token);
	if (!m) throw new Error(`Bad degree: ${token}`);
	let alt = 0;
	for (const ch of m[1]) alt += ACC[ch];
	const steps = mod(Number(m[2]) - 1, 7);
	return { steps, semis: mod(NATURAL[steps] + alt, 12) };
}

/** Pretty degree: 'b13' → '♭13' */
export function prettyDegree(token: string): string {
	return token.replace(/b/g, '♭').replace(/#/g, '♯');
}

/** Interval → degree token relative to a major scale ('♭3', '♯4', '5'). */
export function intervalDegree(iv: Interval): string {
	const alt = mod(iv.semis - NATURAL[iv.steps] + 6, 12) - 6;
	return accidental(alt) + String(iv.steps + 1);
}

// ---- MIDI ------------------------------------------------------------------

/** Lowest MIDI number ≥ `min` that has this pitch class. */
export function midiAtOrAbove(p: Pitch, min: number): number {
	return min + mod(pc(p) - min, 12);
}

const SOLFEGE = ['도', '레', '미', '파', '솔', '라', '시'];

/** Movable-do syllable of `p` in a key whose tonic is `tonic` (e.g. in A, G♯ → 시, D → 파). */
export function solfege(p: Pitch, tonic: Pitch): string {
	const iv = interval(tonic, p);
	const alt = mod(iv.semis - NATURAL[iv.steps] + 6, 12) - 6;
	return accidental(alt) + SOLFEGE[iv.steps];
}
