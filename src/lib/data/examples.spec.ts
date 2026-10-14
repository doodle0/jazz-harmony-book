// Automatic checks for example sets (plan §7): every progression parses, resolves
// and voices in all 12 keys, renders a groove, and displays in lecture notation.
import { describe, it, expect } from 'vitest';
import { arrange, rollAfterFirst, type ExampleSet } from '#lib/music/example.ts';
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

// Self-check questions: every sound plays, every choice question has its answer among the options.
const quizzes = import.meta.glob<{ id: string; questions: { kind: string; options?: string[]; answer: number | string; hear?: { prog: string; key?: string } }[] }>(
	'./quizzes/*.json',
	{ eager: true, import: 'default' }
);

describe.each(Object.entries(quizzes))('%s', (_, quiz) => {
	it('is well formed and its sounds resolve', () => {
		expect(quiz.questions.length).toBeGreaterThanOrEqual(2);
		for (const q of quiz.questions) {
			if (q.kind === 'choice') expect(q.options![q.answer as number]).toBeDefined();
			else expect(typeof q.answer).toBe('string');
			if (q.hear) {
				const key = parseKey(q.hear.key ?? 'C');
				const a = arrange({ id: 'q', title: 'q', style: 'swing', key: q.hear.key ?? 'C', tempo: 120, prog: q.hear.prog, provenance: { status: 'generated', origin: 'ai' } }, { key });
				expect(a.chords.length).toBeGreaterThan(0);
			}
		}
	});
});

it('journey steps line up with their chords', () => {
	for (const set of Object.values(sets)) {
		for (const e of set.examples as (typeof set.examples[number] & { steps?: unknown[] })[]) {
			if (!e.steps) continue;
			expect(e.steps.length, e.id).toBe(arrange(e).chords.length);
		}
	}
});

it('the Lydian chord pill stacks thirds from C3, then rolls the second chord', () => {
	const ex = { id: 'lyd', title: 'lyd', style: 'pad' as const, key: 'C', tempo: 70, prog: 'IΔ7(9, ♯11, 13) | %', stack: '1 3 5 7 9 ♯11 13', stackLow: 48, provenance: { status: 'generated' as const, origin: 'ai' as const } };
	const a = arrange(ex);
	expect(a.voicings[0].notes.map((n) => n.midi)).toEqual([48, 52, 55, 59, 62, 66, 69]);
	const rolled = rollAfterFirst(a.seq, a.chords).notes.filter((n) => n.inst === 'piano');
	expect(rolled[0].midi).toHaveLength(7);
	const second = rolled.slice(1);
	expect(second.map((n) => n.midi[0])).toEqual([48, 52, 55, 59, 62, 66, 69]);
	expect(second.every((n, i) => i === 0 || n.beat > second[i - 1].beat)).toBe(true);
});
