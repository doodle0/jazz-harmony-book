import { describe, it, expect } from 'vitest';
import { pitch, noteName, transpose, degreeInterval, solfege, simplify } from './pitch';
import { parseChord } from './chord';
import { formatChord, formatNote } from './format';
import { romanToChord } from './roman';
import { parseProgression, resolveProgression, parseKey } from './progression';
import { voiceProgression, voiceStack } from './voicing';
import { avoidNotes, MODES } from './scales';

const names = (ms: { pitch: { step: number; alt: number } }[]) => ms.map((n) => noteName(n.pitch)).join(' ');

describe('pitch', () => {
	it('keeps spelling when transposing', () => {
		expect(noteName(transpose(pitch('E♭'), degreeInterval('3')))).toBe('G');
		expect(noteName(transpose(pitch('B♭'), degreeInterval('b3')))).toBe('D♭');
		expect(noteName(transpose(pitch('F♯'), degreeInterval('7')))).toBe('E♯');
	});
	it('simplifies double accidentals', () => {
		expect(noteName(simplify(pitch('Fbb')))).toBe('E♭');
		expect(noteName(simplify(pitch('C♭'), true))).toBe('B');
	});
	it('names movable-do syllables like the lecture', () => {
		expect(solfege(pitch('D'), pitch('A'))).toBe('파');
		expect(solfege(pitch('G#'), pitch('A'))).toBe('시');
		expect(solfege(pitch('Bb'), pitch('C'))).toBe('♭시');
	});
});

describe('format', () => {
	it.each([
		['Cmaj7', 'CΔ7'],
		['Dm7', 'D-7'],
		['Bm7b5', 'Bø7'],
		['Bdim7', 'Bo7'],
		['G7b9', 'G7(♭9)'],
		['G7(b9, b13)', 'G7(♭9, ♭13)'],
		['C7alt', 'C7alt'],
		['C7sus', 'C7sus'],
		['C+7', 'C+7'],
		['CmMaj7', 'C-Δ7'],
		['Ebmaj7', 'E♭Δ7'],
		['F#m7b5', 'F♯ø7'],
		['Db7(#11)', 'D♭7(♯11)'],
		['C6/9', 'C6(9)'],
		['G7(b9 b13)', 'G7(♭9, ♭13)']
	])('%s → %s', (input, out) => {
		expect(formatChord(input)).toBe(out);
	});
	it('keeps lecture notation as is', () => {
		for (const s of ['CΔ7', 'D-7', 'G7', 'Bø7', 'Bo7', 'C-6', 'G7(♭9, ♭13)']) expect(formatChord(s)).toBe(s);
	});
	it('writes plain extensions as one number, like the guide', () => {
		expect(['D-9', 'G13', 'CΔ9', 'C9sus', 'G7(♭9, 13)', 'C-7(9, 11)'].map((c) => formatChord(c))).toEqual([
			'D-9',
			'G13',
			'CΔ9',
			'C9sus',
			'G7(♭9, 13)',
			'C-7(9, 11)'
		]);
	});
	it('reads extensions as tensions', () => {
		expect(parseChord('G13').tensions).toEqual(['9', '13']);
		expect(parseChord('G13(b9)').tensions).toEqual(['b9', '13']);
		expect(parseChord('D-9').quality).toBe('min7');
	});
	it('formats note names', () => {
		expect(formatNote('Bb')).toBe('B♭');
		expect(formatNote('F#')).toBe('F♯');
	});
});

describe('roman', () => {
	const C = pitch('C');
	it.each([
		['ii-7', 'C', 'D-7'],
		['V7', 'C', 'G7'],
		['IΔ7', 'E♭', 'E♭Δ7'],
		['ii-7', 'E♭', 'F-7'],
		['V7/V', 'C', 'D7'],
		['V7/vi', 'C', 'E7'],
		['iiø7/vi', 'C', 'Bø7'],
		['subV7', 'C', 'D♭7'],
		['subV7/ii', 'C', 'E♭7'],
		['♯ivø7', 'F', 'Bø7'],
		['♭VII7', 'G', 'F7'],
		['iv-7', 'G', 'C-7'],
		['♭iii-7', 'G', 'B♭-7'],
		['viio7', 'C', 'Bo7'],
		['vi', 'C', 'A-'],
		['V7(♭9, ♭13)', 'C', 'G7(♭9, ♭13)'],
		['♯io7', 'E♭', 'Eo7']
	])('%s in %s → %s', (roman, key, out) => {
		expect(formatChord(romanToChord(roman, pitch(key)))).toBe(out);
	});
	it('handles uppercase triads', () => {
		expect(formatChord(romanToChord('V', C))).toBe('G');
	});
});

describe('progression', () => {
	it('splits bars and repeats', () => {
		const p = parseProgression('ii-7 V7 | IΔ7 | %');
		expect(p.map((c) => [c.roman, c.start, c.beats])).toEqual([
			['ii-7', 0, 2],
			['V7', 2, 2],
			['IΔ7', 4, 4],
			['IΔ7', 8, 4]
		]);
	});
	it('takes explicit durations', () => {
		const p = parseProgression('ii-7:3 V7 | IΔ7', 4);
		expect(p[1].beats).toBe(1);
	});
	it('All of Me opening in three keys', () => {
		const src = 'IΔ7 | % | V7/vi | % | V7/ii | % | ii-7 | %';
		const sym = (k: string) =>
			resolveProgression(parseProgression(src), parseKey(k))
				.filter((_, i) => i % 2 === 0)
				.map((c) => c.symbol)
				.join(' ');
		expect(sym('C')).toBe('CΔ7 E7 A7 D-7');
		expect(sym('G')).toBe('GΔ7 B7 E7 A-7');
		expect(sym('A♭')).toBe('A♭Δ7 C7 F7 B♭-7');
	});
});

describe('voicing', () => {
	it('reproduces the guide’s alternating A/B ii-V-I in C', () => {
		const chords = ['D-9', 'G13', 'CΔ9'].map(parseChord);
		const v = voiceProgression(chords, 'alternate');
		// A form → B form → A form
		expect(names(v[0].notes)).toBe('F A C E');
		expect(names(v[1].notes)).toBe('F A B E');
		expect(names(v[2].notes)).toBe('E G B D');
	});
	it('auto rootless finds the same smooth path', () => {
		const v = voiceProgression(['D-7', 'G7', 'CΔ7'].map(parseChord), 'rootless');
		expect(v.map((x) => names(x.notes))).toEqual(['F A C E', 'F A B E', 'E G B D']);
	});
	it('voices the minor ii-V-i like the guide', () => {
		const v = voiceProgression(['Dø7', 'G7(b9, b13)', 'C-9'].map(parseChord), 'alternate', { startForm: 'B' });
		expect(names(v[1].notes)).toBe('B E♭ F A♭');
		expect(names(v[2].notes)).toBe('B♭ D E♭ G');
		expect(names(v[0].notes)).toBe('C F A♭');
	});
	it('every voice moves by step or less in the major ii-V-I', () => {
		const v = voiceProgression(['D-7', 'G7', 'CΔ7'].map(parseChord), 'alternate');
		for (let i = 1; i < v.length; i++) {
			v[i].notes.forEach((n, j) => expect(Math.abs(n.midi - v[i - 1].notes[j].midi)).toBeLessThanOrEqual(2));
		}
	});
	const rootless = (c: string) => names(voiceProgression([parseChord(c)], 'A')[0].notes);
	it('keeps written tensions in rootless voicings', () => {
		expect(rootless('C7(♯11)')).toBe('E A B♭ D F♯');
		expect(rootless('D7(♭5)')).toBe('F♯ A♭ C E');
		expect(rootless('D7(♯5)')).toBe('F♯ A♯ C E');
		expect(rootless('CΔ7(♯11)')).toBe('E F♯ B D');
		expect(rootless('CΔ7(9, ♯11, 13)')).toBe('E F♯ B D A');
		expect(rootless('C-11')).toBe('E♭ F B♭ D');
		expect(rootless('C-7(13)')).toBe('E♭ A B♭ D');
	});
	it('tells 7sus, 9sus and 13sus apart', () => {
		expect(rootless('C7sus')).toBe('F G B♭ C');
		expect(rootless('C9sus')).toBe('F G B♭ D');
		expect(rootless('C13sus')).toBe('F A B♭ D');
	});
	it('keeps the ♭7 of 7alt in close position', () => {
		expect(names(voiceProgression([parseChord('C7alt')], 'close')[0].notes)).toBe('C E G♭ B♭');
	});
	it('stacks fifths for the Lydian chord', () => {
		expect(names(voiceStack(parseChord('CΔ7(9, ♯11, 13)'), ['1', '5', '9', '13', '3', '7', '♯11']).notes)).toBe('C G D A E B F♯');
	});
});

describe('avoid notes', () => {
	const scale = (id: string) => MODES.find((m) => m.id === id)!.degrees;
	it('matches the guide table', () => {
		expect(avoidNotes(parseChord('CΔ7'), scale('ionian'))).toEqual(['4']);
		expect(avoidNotes(parseChord('CΔ7'), scale('lydian'))).toEqual([]);
		expect(avoidNotes(parseChord('C7'), scale('mixolydian'))).toEqual(['4']);
		expect(avoidNotes(parseChord('C-7'), scale('dorian'))).toEqual([]);
		expect(avoidNotes(parseChord('C-7'), scale('aeolian'))).toEqual(['b6']);
		expect(avoidNotes(parseChord('C-7'), scale('phrygian'))).toEqual(['b2', 'b6']);
		expect(avoidNotes(parseChord('Cø7'), scale('locrian'))).toEqual(['b2']);
	});
});
