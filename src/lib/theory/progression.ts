// Progressions are authored as Roman numerals in bars, e.g. "ii-7 V7 | IΔ7 | %".
// Chords in a bar split it evenly unless a duration is given ("ii-7:3 V7:1").
// '%' repeats the previous bar. Resolving against a key gives chord symbols, so
// transposing an example is just resolving it again with another tonic.

import { parseChord, type Chord } from './chord';
import { romanToChord } from './roman';
import { pc, pitch, noteName, type Pitch } from './pitch';
import { formatChord, formatRoman } from './format';

export interface ProgChord {
	roman: string;
	/** start, in beats from the beginning */
	start: number;
	beats: number;
	bar: number;
}

export interface ResolvedChord extends ProgChord {
	chord: Chord;
	symbol: string;
	romanLabel: string;
}

export interface Key {
	tonic: Pitch;
	minor: boolean;
}

/** Splits on whitespace that is not inside parentheses. */
function tokens(bar: string): string[] {
	const out: string[] = [];
	let depth = 0;
	let cur = '';
	for (const ch of bar) {
		if (ch === '(') depth++;
		if (ch === ')') depth--;
		if (/\s/.test(ch) && depth === 0) {
			if (cur) out.push(cur);
			cur = '';
		} else cur += ch;
	}
	if (cur) out.push(cur);
	return out;
}

export function parseProgression(src: string, beatsPerBar = 4): ProgChord[] {
	const bars = src.split('|').map((b) => b.trim());
	const out: ProgChord[] = [];
	let prev: string[] = [];
	let start = 0;
	bars.forEach((barSrc, bar) => {
		let toks = tokens(barSrc);
		if (toks.length === 1 && toks[0] === '%') toks = prev;
		if (toks.length === 0) throw new Error(`Empty bar ${bar + 1} in "${src}"`);
		prev = toks;
		const explicit = toks.map((t) => /:(\d+(?:\.\d+)?)$/.exec(t)?.[1]);
		const fixed = explicit.reduce((s, e) => s + (e ? Number(e) : 0), 0);
		const free = explicit.filter((e) => !e).length;
		const each = free ? (beatsPerBar - fixed) / free : 0;
		for (let i = 0; i < toks.length; i++) {
			const roman = toks[i].replace(/:(\d+(?:\.\d+)?)$/, '');
			const beats = explicit[i] ? Number(explicit[i]) : each;
			out.push({ roman, start, beats, bar });
			start += beats;
		}
	});
	return out;
}

export function resolveProgression(prog: ProgChord[], key: Key): ResolvedChord[] {
	return prog.map((p) => {
		const chord = romanToChord(p.roman, key.tonic);
		return { ...p, chord, symbol: formatChord(chord), romanLabel: formatRoman(p.roman) };
	});
}

export function totalBeats(prog: ProgChord[]): number {
	const last = prog[prog.length - 1];
	return last ? last.start + last.beats : 0;
}

// ---- keys ---------------------------------------------------------------

/** Preferred spelling of each tonic pitch class, as jazz players name keys. */
const MAJOR_TONICS = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
const MINOR_TONICS = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'B♭', 'B'];

export function parseKey(name: string): Key {
	const minor = name.endsWith('-') || name.endsWith('m');
	return { tonic: pitch(minor ? name.slice(0, -1) : name), minor };
}

export function keyName(key: Key): string {
	return noteName(key.tonic) + (key.minor ? ' 마이너' : '');
}

export function keyShortName(key: Key): string {
	return noteName(key.tonic) + (key.minor ? '-' : '');
}

/** All 12 keys of the same mode, in chromatic order from C. */
export function allKeys(minor: boolean): Key[] {
	return (minor ? MINOR_TONICS : MAJOR_TONICS).map((t) => ({ tonic: pitch(t), minor }));
}

export function sameKey(a: Key, b: Key): boolean {
	return pc(a.tonic) === pc(b.tonic) && a.minor === b.minor;
}

export { parseChord };
