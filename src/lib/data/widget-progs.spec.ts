// Progressions that widgets build in code (not in example sets) must also play in all
// 12 keys and display in lecture notation.
import { it, expect } from 'vitest';
import { arrange } from '#lib/music/example.ts';
import { allKeys } from '#lib/theory/progression.ts';

const PROGS = [
	// ScaleChooser
	'ii-7 | V7alt | IΔ7 | %',
	'iiø7 | V7(♭9, ♭13) | i-6 | %',
	'IΔ7 | V7(♭9, ♭13)/vi | vi-7 | %',
	'ii-7 | subV7(♯11) | IΔ7 | %',
	'IΔ7 | V7(♯11)/V | ii-7 | V7',
	'ii-7 | V+7 | IΔ7 | %',
	'ii-7 | V7(♭9, 13) | IΔ7 | %',
	'ii-7 | V7(♭13) | i-6 | %',
	// TritoneTwins
	'ii-7 | V7(9, ♯11, 13) | IΔ7 | %',
	'ii-7 | subV7alt | IΔ7 | %',
	'ii-7 | V+7(9, ♯11) | IΔ7 | %',
	// HomeTone
	'I6 | IV7 | I6 | iiø7/vi V7/vi | vi-7 | iiø7/III V7/III | IIIΔ7 | ii-7 V7',
	'IΔ7 | % | ii-7/♭III V7/♭III | ♭IIIΔ7 | vi-7/♭III | ii-7/♭III V7/♭III | ♭IIIΔ7 | ii-7 V7',
	// WhereDoesVGo
	'ii-7 | V7 | ♭VIΔ7 | %',
	// DownbeatAligner, OneBeatEarly, SixthDim, planing pad
	'V7 | %',
	'i-6 | %',
	'vi-7 | ii-7 | V7 | IΔ7',
	'I9sus:2 I9sus:2 | I9sus:2 I9sus:2'
];

it.each(PROGS)('%s plays in every key', (prog) => {
	for (const key of allKeys(false)) {
		const a = arrange({ id: 'w', title: 'w', style: 'swing', key: 'C', tempo: 120, prog, provenance: { status: 'generated', origin: 'ai' } }, { key });
		for (const c of a.chords) expect(c.symbol).not.toMatch(/maj|min|m7|dim|aug|[b#](?![^(]*\))|𝄫|𝄪/);
	}
});
