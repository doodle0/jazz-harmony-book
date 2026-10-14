// Automatic checks for example sets (plan §7): every progression parses, resolves
// and voices in all 12 keys, renders a groove, and displays in lecture notation.
import { describe, it, expect } from 'vitest';
import { arrange, type ExampleSet } from '#lib/music/example.ts';
import { allKeys, parseKey } from '#lib/theory/progression.ts';
import { GROOVES } from '#lib/audio/grooves/index.ts';

const sets = import.meta.glob<ExampleSet>('./examples/*.json', { eager: true, import: 'default' });

describe.each(Object.entries(sets))('%s', (_, set) => {
	it('has unique ids and known styles', () => {
		const ids = set.examples.map((e) => e.id);
		expect(new Set(ids).size).toBe(ids.length);
		for (const e of set.examples) expect(GROOVES[e.style]).toBeDefined();
	});

	it.each(set.examples.map((e) => [e.id, e] as const))('%s plays in every key', (_, ex) => {
		const variants = ex.variants ? Object.keys(ex.variants) : [undefined];
		const minor = parseKey(ex.key).minor;
		for (const key of allKeys(minor)) {
			for (const variant of variants) {
				const a = arrange(ex, { key, variant });
				expect(a.seq.notes.length).toBeGreaterThan(0);
				for (const c of a.chords) {
					// lecture notation only: no tonal-style spellings or double accidentals
					expect(c.symbol).not.toMatch(/maj|min|m7|dim|aug|[b#](?![^(]*\))|𝄫|𝄪/);
				}
				for (const v of a.voicings) for (const n of v.notes) expect(n.midi).toBeGreaterThan(30);
			}
		}
	});
});

it('every set has at most five grooves', () => {
	for (const [file, set] of Object.entries(sets)) expect(set.examples.length, file).toBeLessThanOrEqual(5);
});

it('every concept set spans at least two styles', () => {
	for (const [file, set] of Object.entries(sets)) {
		const styles = new Set(set.examples.map((e) => e.style));
		expect(styles.size, file).toBeGreaterThanOrEqual(2);
	}
});
