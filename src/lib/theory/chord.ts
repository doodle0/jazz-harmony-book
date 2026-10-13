// Chord symbols. Parses both the lecture's notation (CΔ7, D-7, Bø7, G7(♭9, ♭13))
// and common/tonal spellings (Cmaj7, Dm7, Bm7b5, G7b9), into one structure.
// Display goes through format.ts.

import { degreeInterval, parsePitch, transpose, type Pitch } from './pitch';

export type Quality =
	| 'maj'
	| 'min'
	| 'dim'
	| 'aug'
	| 'sus'
	| 'maj7'
	| 'maj6'
	| 'dom7'
	| 'min7'
	| 'min6'
	| 'minMaj7'
	| 'halfDim7'
	| 'dim7'
	| 'sus7'
	| 'aug7'
	| 'alt7'
	| 'maj7#5';

export interface Chord {
	root: Pitch;
	quality: Quality;
	/** Explicit tensions/alterations as degree tokens: '9', 'b9', '#11', 'b13', '13', '11', 'b5', '#5' */
	tensions: string[];
	bass?: Pitch;
}

/** Chord tones (degree tokens) per quality, bottom-up from the root. */
export const CHORD_TONES: Record<Quality, string[]> = {
	maj: ['1', '3', '5'],
	min: ['1', 'b3', '5'],
	dim: ['1', 'b3', 'b5'],
	aug: ['1', '3', '#5'],
	sus: ['1', '4', '5'],
	maj7: ['1', '3', '5', '7'],
	maj6: ['1', '3', '5', '6'],
	dom7: ['1', '3', '5', 'b7'],
	min7: ['1', 'b3', '5', 'b7'],
	min6: ['1', 'b3', '5', '6'],
	minMaj7: ['1', 'b3', '5', '7'],
	halfDim7: ['1', 'b3', 'b5', 'b7'],
	dim7: ['1', 'b3', 'b5', 'bb7'],
	sus7: ['1', '4', '5', 'b7'],
	aug7: ['1', '3', '#5', 'b7'],
	alt7: ['1', '3', 'b7'],
	'maj7#5': ['1', '3', '#5', '7']
};

/** Display suffix per quality, lecture notation. */
export const QUALITY_SUFFIX: Record<Quality, string> = {
	maj: '',
	min: '-',
	dim: 'o',
	aug: '+',
	sus: 'sus',
	maj7: 'Δ7',
	maj6: '6',
	dom7: '7',
	min7: '-7',
	min6: '-6',
	minMaj7: '-Δ7',
	halfDim7: 'ø7',
	dim7: 'o7',
	sus7: '7sus',
	aug7: '+7',
	alt7: '7alt',
	'maj7#5': 'Δ7♯5'
};

// Longest match first. Each entry: [suffix, quality, implied tensions]
const SUFFIXES: [string, Quality, string[]][] = [
	// lecture notation
	['-Δ7', 'minMaj7', []],
	['-Δ9', 'minMaj7', ['9']],
	['-Δ', 'minMaj7', []],
	['Δ7♯5', 'maj7#5', []],
	['Δ7#5', 'maj7#5', []],
	['+Δ7', 'maj7#5', []],
	['Δ13', 'maj7', ['9', '13']],
	['Δ9', 'maj7', ['9']],
	['Δ7', 'maj7', []],
	['Δ', 'maj7', []],
	['-6/9', 'min6', ['9']],
	['6/9', 'maj6', ['9']],
	['-13', 'min7', ['9', '11', '13']],
	['-11', 'min7', ['9', '11']],
	['-9', 'min7', ['9']],
	['-7', 'min7', []],
	['-6', 'min6', []],
	['ø9', 'halfDim7', ['9']],
	['ø7', 'halfDim7', []],
	['ø', 'halfDim7', []],
	['o7', 'dim7', []],
	['°7', 'dim7', []],
	['+7', 'aug7', []],
	['+9', 'aug7', ['9']],
	['7alt', 'alt7', ['b9', '#9', 'b5', 'b13']],
	['alt', 'alt7', ['b9', '#9', 'b5', 'b13']],
	['13sus', 'sus7', ['9', '13']],
	['9sus', 'sus7', ['9']],
	['7sus4', 'sus7', []],
	['7sus', 'sus7', []],
	['sus4', 'sus', []],
	['sus', 'sus7', []],
	['13', 'dom7', ['9', '13']],
	['11', 'dom7', ['9', '11']],
	['9', 'dom7', ['9']],
	['7', 'dom7', []],
	['6', 'maj6', []],
	['-', 'min', []],
	['o', 'dim', []],
	['°', 'dim', []],
	['+', 'aug', []],
	// common / tonal spellings
	['maj13', 'maj7', ['9', '13']],
	['maj9', 'maj7', ['9']],
	['maj7', 'maj7', []],
	['M7', 'maj7', []],
	['mMaj7', 'minMaj7', []],
	['mmaj7', 'minMaj7', []],
	['m7b5', 'halfDim7', []],
	['m7♭5', 'halfDim7', []],
	['m11', 'min7', ['9', '11']],
	['m9', 'min7', ['9']],
	['m7', 'min7', []],
	['min7', 'min7', []],
	['m6', 'min6', []],
	['dim7', 'dim7', []],
	['dim', 'dim', []],
	['aug', 'aug', []],
	['min', 'min', []],
	['m', 'min', []],
	['', 'maj', []]
];

const TENSION_TOKEN = /^([♭♯b#]?)(5|9|11|13)$/u;

function normTension(t: string): string {
	return t.replace(/♭/g, 'b').replace(/♯/g, '#');
}

/** Parses a chord symbol. Throws on anything it can't read. */
export function parseChord(symbol: string): Chord {
	const s = symbol.trim();
	const rootMatch = /^([A-G][♭♯b#]?)/u.exec(s);
	if (!rootMatch) throw new Error(`Bad chord root: ${symbol}`);
	const root = parsePitch(rootMatch[1]);
	if (!root) throw new Error(`Bad chord root: ${symbol}`);
	let rest = s.slice(rootMatch[1].length);

	// slash bass (but not 6/9)
	let bass: Pitch | undefined;
	const slash = /\/([A-G][♭♯b#]?)$/u.exec(rest);
	if (slash) {
		bass = parsePitch(slash[1]) ?? undefined;
		rest = rest.slice(0, slash.index);
	}

	// parenthesised tensions
	const tensions: string[] = [];
	const paren = /\(([^)]*)\)$/u.exec(rest);
	if (paren) {
		for (const t of paren[1].split(/[\s,]+/).filter(Boolean)) {
			const n = normTension(t);
			if (!TENSION_TOKEN.test(n)) throw new Error(`Bad tension "${t}" in ${symbol}`);
			tensions.push(n);
		}
		rest = rest.slice(0, paren.index);
	}

	// trailing unparenthesised alterations, tonal-style: G7b9, G7#11b13
	const trailing: string[] = [];
	let base = rest;
	while (!SUFFIXES.some(([suffix]) => suffix === base)) {
		const m = /([♭♯b#](?:5|9|11|13))$/u.exec(base);
		if (!m || m.index === 0) break;
		trailing.unshift(normTension(m[1]));
		base = base.slice(0, m.index);
	}

	const entry = SUFFIXES.find(([suffix]) => suffix === base);
	if (!entry) throw new Error(`Unknown chord quality "${base}" in ${symbol}`);
	const [, quality, implied] = entry;
	// an explicit tension replaces the implied one with the same number (13 → ♭13, 9 → ♭9)
	const out = [...implied];
	for (const t of [...trailing, ...tensions]) {
		const num = t.replace(/[b#]/g, '');
		for (let i = out.length - 1; i >= 0; i--) {
			if (implied.includes(out[i]) && out[i].replace(/[b#]/g, '') === num) out.splice(i, 1);
		}
		if (!out.includes(t)) out.push(t);
	}
	return { root, quality, tensions: sortTensions(out), bass };
}

const TENSION_ORDER = ['b5', '#5', 'b9', '9', '#9', '11', '#11', 'b13', '13'];
function sortTensions(ts: string[]) {
	return [...ts].sort((a, b) => TENSION_ORDER.indexOf(a) - TENSION_ORDER.indexOf(b));
}

export function isChordSymbol(token: string): boolean {
	try {
		parseChord(token);
		return true;
	} catch {
		return false;
	}
}

/** Third quality, for Roman-numeral case. */
export function hasMajorThird(q: Quality): boolean {
	return ['maj', 'aug', 'maj7', 'maj6', 'dom7', 'aug7', 'alt7', 'maj7#5'].includes(q);
}

export function isDominant(c: Chord): boolean {
	return c.quality === 'dom7' || c.quality === 'alt7' || c.quality === 'aug7' || c.quality === 'sus7';
}

export function transposeChord(c: Chord, iv: { steps: number; semis: number }): Chord {
	return {
		...c,
		root: transpose(c.root, iv),
		bass: c.bass ? transpose(c.bass, iv) : undefined
	};
}

/** Chord tones as spelled pitches (root first). */
export function chordTonePitches(c: Chord): { degree: string; pitch: Pitch }[] {
	return CHORD_TONES[c.quality].map((d) => ({ degree: d, pitch: transpose(c.root, degreeInterval(d)) }));
}
