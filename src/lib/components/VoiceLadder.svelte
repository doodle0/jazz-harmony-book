<script lang="ts">
	// Voice-leading ladder: each chord is a column, each note a dot at its pitch,
	// and lines connect voice i of one chord to voice i of the next. Short lines =
	// smooth voice leading.
	import type { Voicing } from '#lib/theory/voicing.ts';
	import type { ResolvedChord } from '#lib/theory/progression.ts';

	let {
		chords,
		voicings,
		labelOf,
		active = -1
	}: {
		chords: ResolvedChord[];
		voicings: Voicing[];
		labelOf: (chordIndex: number, noteIndex: number) => string;
		active?: number;
	} = $props();

	// merge repeated chords (e.g. "IΔ9 | %") into one column
	let cols = $derived.by(() => {
		const out: { i: number }[] = [];
		chords.forEach((c, i) => {
			if (i === 0 || c.symbol !== chords[i - 1].symbol) out.push({ i });
		});
		return out;
	});

	let range = $derived.by(() => {
		const all = cols.flatMap((c) => voicings[c.i].notes.map((n) => n.midi));
		return { lo: Math.min(...all) - 1, hi: Math.max(...all) + 1 };
	});

	const W = 300;
	const H = 170;
	const PAD_X = 46;
	const PAD_Y = 16;
	let x = (k: number) => PAD_X + (k * (W - 2 * PAD_X)) / Math.max(1, cols.length - 1);
	let y = (m: number) => PAD_Y + ((range.hi - m) * (H - 2 * PAD_Y)) / (range.hi - range.lo);

	const VOICE_COLORS = ['var(--teal)', 'var(--tomato)', 'var(--plum)', 'var(--sky)', 'var(--leaf)'];

	let activeCol = $derived.by(() => {
		if (active < 0) return -1;
		let k = -1;
		cols.forEach((c, j) => {
			if (c.i <= active) k = j;
		});
		return k;
	});
</script>

<svg viewBox="0 0 {W} {H + 28}" class="w-full" role="img" aria-label="보이스 리딩 사다리">
	<!-- staff-ish guide lines -->
	{#each [0.2, 0.4, 0.6, 0.8] as f (f)}
		<line x1="8" x2={W - 8} y1={PAD_Y + f * (H - 2 * PAD_Y)} y2={PAD_Y + f * (H - 2 * PAD_Y)} stroke="var(--ink)" stroke-opacity="0.08" stroke-width="1" />
	{/each}
	{#each cols as c, k (c.i)}
		{#if k > 0}
			{@const prev = voicings[cols[k - 1].i].notes}
			{#each voicings[c.i].notes as n, j (j)}
				{@const p = prev[Math.min(j, prev.length - 1)]}
				<line
					x1={x(k - 1)}
					y1={y(p.midi)}
					x2={x(k)}
					y2={y(n.midi)}
					stroke={VOICE_COLORS[j % VOICE_COLORS.length]}
					stroke-width="3.5"
					stroke-linecap="round"
					stroke-dasharray={p.midi === n.midi ? '2 5' : ''}
				/>
			{/each}
		{/if}
	{/each}
	{#each cols as c, k (c.i)}
		<g class="transition-transform" style:transform-origin="{x(k)}px {H / 2}px" style:transform={k === activeCol ? 'scale(1.08)' : ''}>
			{#each voicings[c.i].notes as n, j (j)}
				<circle cx={x(k)} cy={y(n.midi)} r="11" fill={k === activeCol ? 'var(--mustard)' : 'var(--card)'} stroke="var(--ink)" stroke-width="2" />
				<text x={x(k)} y={y(n.midi)} text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="800" fill={k === activeCol ? 'var(--on-color)' : 'var(--ink)'}>
					{labelOf(c.i, j)}
				</text>
			{/each}
			<text x={x(k)} y={H + 16} text-anchor="middle" font-size="13" font-weight="800" fill="var(--ink)">{chords[c.i].symbol}</text>
		</g>
	{/each}
</svg>
