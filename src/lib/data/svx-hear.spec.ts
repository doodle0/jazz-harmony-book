// Every <Hear prog=…> in the chapters must parse and resolve.
import { describe, it, expect } from 'vitest';
import { arrange } from '#lib/music/example.ts';
import { parseKey } from '#lib/theory/progression.ts';

const chapters = import.meta.glob<string>('/src/content/*.svx', { eager: true, query: '?raw', import: 'default' });

describe('chapter <Hear> progressions', () => {
	for (const [file, src] of Object.entries(chapters)) {
		for (const m of src.matchAll(/<Hear\b([^>]*)\/>/g)) {
			const attrs = m[1];
			const prog = /prog="([^"]*)"/.exec(attrs)![1];
			const key = /key="([^"]*)"/.exec(attrs)?.[1] ?? 'C';
			it(`${file.split('/').pop()}: ${prog}`, () => {
				const a = arrange(
					{ id: 'x', title: 'x', style: 'swing', key, tempo: 120, prog, provenance: { status: 'generated', origin: 'ai' } },
					{ key: parseKey(key) }
				);
				expect(a.chords.length).toBeGreaterThan(0);
			});
		}
	}
});
