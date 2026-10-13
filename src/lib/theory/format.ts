// The only place that turns chords into display strings (plan §3).
// Accepts parsed chords or any symbol parseChord understands, including tonal-style
// names like 'Cmaj7', 'Dm7', 'Bm7b5', and returns the lecture notation.

import { parseChord, QUALITY_SUFFIX, type Chord } from './chord';
import { noteName, prettyDegree } from './pitch';

/** Tensions that are implied by the quality suffix and shouldn't be repeated in parentheses. */
const IMPLIED_BY_SUFFIX: Partial<Record<string, string[]>> = {
	'7alt': ['b9', '#9', 'b5', 'b13']
};

const EXTENSION_NAMES: Partial<Record<Chord['quality'], Record<string, string>>> = {
	maj7: { '9': 'Δ9', '9 13': 'Δ13' },
	min7: { '9': '-9' },
	dom7: { '9': '9', '9 13': '13' },
	sus7: { '9': '9sus', '9 13': '13sus' },
	minMaj7: { '9': '-Δ9' }
};

export function formatChord(chord: Chord | string): string {
	const c = typeof chord === 'string' ? parseChord(chord) : chord;
	let suffix = QUALITY_SUFFIX[c.quality];
	const implied = IMPLIED_BY_SUFFIX[suffix] ?? [];
	let tensions = c.tensions.filter((t) => !implied.includes(t));
	// plain extensions read as one number, the way the guide writes them: D-9, G13, CΔ9
	const ext = EXTENSION_NAMES[c.quality]?.[tensions.join(' ')];
	if (ext) {
		suffix = ext;
		tensions = [];
	}
	let out = noteName(c.root) + suffix;
	if (tensions.length) out += `(${tensions.map(prettyDegree).join(' ')})`;
	if (c.bass) out += '/' + noteName(c.bass);
	return out;
}

/** Note name in display notation: 'Bb' → 'B♭'. */
export function formatNote(name: string): string {
	return name.replace(/(?<=[A-G])bb/g, '𝄫').replace(/(?<=[A-G])b/g, '♭').replace(/#/g, '♯');
}

/** Roman numeral strings are authored in lecture notation; normalise ASCII accidentals. */
export function formatRoman(roman: string): string {
	return roman
		.replace(/^b(?=[IViv])/u, '♭')
		.replace(/^#(?=[IViv])/u, '♯')
		.replace(/\(([^)]*)\)/g, (_, inner: string) => `(${inner.replace(/b/g, '♭').replace(/#/g, '♯')})`);
}
