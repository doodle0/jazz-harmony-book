// Roman numerals → chords in a key. Numerals are read against the major scale of
// the tonic (Berklee/lecture convention): in C minor, E♭Δ7 is ♭IIIΔ7.
// Supports secondary functions ('V7/V', 'iiø7/vi') and tritone subs ('subV7', 'subV7/ii').

import { parseChord, type Chord } from './chord';
import { degreeInterval, noteName, simplify, transpose, type Pitch } from './pitch';

const NUMERALS = ['VII', 'III', 'VI', 'IV', 'II', 'V', 'I'];
const VALUE: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7 };

interface ParsedRoman {
	sub: boolean;
	acc: string;
	degree: number;
	upper: boolean;
	suffix: string;
}

function parseOne(token: string): ParsedRoman {
	let s = token;
	let sub = false;
	if (s.startsWith('sub')) {
		sub = true;
		s = s.slice(3);
	}
	const accM = /^[♭♯b#]?/u.exec(s)!;
	const acc = accM[0];
	s = s.slice(acc.length);
	for (const n of NUMERALS) {
		if (s.startsWith(n) || s.startsWith(n.toLowerCase())) {
			const upper = s.startsWith(n);
			return { sub, acc, degree: VALUE[n], upper, suffix: s.slice(n.length) };
		}
	}
	throw new Error(`Bad Roman numeral: ${token}`);
}

/** Root pitch of a numeral degree (with accidental) above `tonic`. */
function degreeRoot(tonic: Pitch, acc: string, degree: number): Pitch {
	const a = acc === '♭' || acc === 'b' ? 'b' : acc === '♯' || acc === '#' ? '#' : '';
	return transpose(tonic, degreeInterval(a + degree));
}

export function isRoman(token: string): boolean {
	return /^(sub)?[♭♯b#]?(VII|VI|V|IV|III|II|I|vii|vi|v|iv|iii|ii|i)/u.test(token);
}

/** 'ii-7' in E♭ → F-7. 'V7/V' in C → D7. 'subV7/ii' in C → E♭7. */
export function romanToChord(roman: string, tonic: Pitch): Chord {
	const [main, target] = splitSecondary(roman);
	let keyTonic = tonic;
	if (target) {
		const t = parseOne(target);
		keyTonic = degreeRoot(tonic, t.acc, t.degree);
	}
	const r = parseOne(main);
	let root = degreeRoot(keyTonic, r.acc, r.degree);
	if (r.sub) root = transpose(root, { steps: 4, semis: 6 }); // tritone, spelled as a diminished 5th
	root = simplify(root);
	let suffix = r.suffix;
	if (!r.upper && !/^[-øo]/u.test(suffix)) suffix = '-' + suffix;
	return parseChord(noteName(root) + suffix);
}

function splitSecondary(roman: string): [string, string | undefined] {
	// a slash followed by a numeral is a secondary function; '6/9' is not
	const m = /^(.*?)\/((?:[♭♯b#])?(?:VII|VI|V|IV|III|II|I|vii|vi|v|iv|iii|ii|i))$/u.exec(roman);
	return m ? [m[1], m[2]] : [roman, undefined];
}
