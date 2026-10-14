<script lang="ts">
	// One-beat-early diminished (guide §4, the lecture's Fly Me to the Moon tip, shown with
	// an original line): the same 8th-note line over vi – ii – V – I, with the last beat
	// before each change played straight down the scale (A) or as the o7 a half step
	// below the next chord (B).
	import WidgetCard from '#lib/components/WidgetCard.svelte';
	import ChordStrip from '#lib/components/ChordStrip.svelte';
	import Segmented from '#lib/components/Segmented.svelte';
	import HearButton from '#lib/components/HearButton.svelte';
	import ShuffleButton from '#lib/components/ShuffleButton.svelte';
	import { Deck, exampleSource } from '#lib/music/deck.svelte.ts';
	import { arrange, type Example } from '#lib/music/example.ts';
	import { lineEvents, parseLine } from '#lib/music/line.ts';
	import { player } from '#lib/stores/player.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { parseKey, type Key } from '#lib/theory/progression.ts';
	import { formatChord } from '#lib/theory/format.ts';
	import { noteLabel } from '#lib/theory/labels.ts';
	import { interval, intervalDegree, transpose, type Pitch } from '#lib/theory/pitch.ts';

	const PROG = 'vi-7 | ii-7 | V7 | IΔ7';
	const LINES = {
		A: '_6 1 3 5 4 3 2 1 | 2 4 6 ^1 7 6 5 4 | 5 7 ^2 ^4 ^3 ^2 ^1 7 | ^1:2 5 3 2 1',
		B: '_6 1 3 5 4 3 _b7 #1 | 2 4 6 ^1 7 6 ^b3 #4 | 5 7 ^2 ^4 ^3 ^2 ^b6 7 | ^1:2 5 3 2 1'
	};
	const prov = { status: 'generated', origin: 'ai', model: 'claude-opus-5-5/v1' } as const;
	const EXAMPLES: Example[] = [
		{ id: 'early-dim-swing', title: '미디엄 스윙', style: 'swing', key: 'C', tempo: 120, prog: PROG, provenance: prov },
		{ id: 'early-dim-bossa', title: '보사노바', style: 'bossa', key: 'F', tempo: 128, prog: PROG, provenance: prov },
		{ id: 'early-dim-ballad', title: '발라드', style: 'ballad', key: 'E♭', tempo: 72, prog: PROG, provenance: prov }
	];

	const id = $props.id();
	const deck = new Deck(EXAMPLES);
	let v = $state<'A' | 'B'>('B');
	let ex = $derived(deck.current);
	let key = $derived(player.keyFor(id, parseKey(ex.key), ex.id));
	let arranged = $derived(arrange(ex, { key }));
	let playing = $derived(player.isPlaying(id));

	let notes = $derived(parseLine(LINES[v], key.tonic));
	// the o7 a half step below each next chord; B plays two of its notes on beat 4
	let dims = $derived(
		arranged.chords.slice(1).map((c) => formatChord({ root: transpose(c.chord.root, { steps: 6, semis: 11 }), quality: 'dim7', tensions: [] }))
	);

	/** a line note's degree above a chord root: the bar's chord, or for the o7 notes the chord they lead into */
	const overChord = (p: Pitch, chord: number) => intervalDegree(interval(arranged.chords[chord].chord.root, p));

	function build(k: Key, which: 'A' | 'B') {
		const line = parseLine(LINES[which], k.tonic);
		const seq = arrange(ex, { key: k, extra: lineEvents(line, 'vibes', 0.75) }).seq;
		seq.marks = line.map((n, i) => ({ beat: n.beat, index: i }));
		return seq;
	}

	function source() {
		const which = v;
		return { ...exampleSource(id, ex), title: `${which === 'A' ? '스케일 그대로' : '한 박자 일찍 o7'} · ${ex.title}`, build: (k: Key) => build(k, which) };
	}
</script>

<WidgetCard
	title="한 박자 일찍 디미니시드"
	kicker="A/B 비교"
	color="var(--sky)"
	example={ex}
	summary="음도는 각 마디 코드의 근음 기준이고, 빨간 음은 다음 코드의 근음 기준입니다. 두 라인은 각 마디의 마지막 박만 다릅니다. B는 그 박에서 다음 코드의 반음 아래 o7을 쳐서, 반음 위로 올라가며 다음 코드에 착지합니다."
>
	<Segmented
		label="라인"
		bind:value={v}
		onchange={() => player.update(source())}
		options={[
			{ value: 'A', label: 'A · 스케일 그대로', color: 'var(--sky)' },
			{ value: 'B', label: 'B · 한 박자 일찍 o7', color: 'var(--tomato)' }
		]}
	/>
	<div class="mt-3 rounded-2xl border-2 border-ink bg-paper-2 p-2.5">
		<ChordStrip chords={arranged.chords} active={-1} />
	</div>
	<div class="mt-3 grid gap-1.5">
		{#each [0, 1, 2, 3] as bar (bar)}
			{@const inBar = notes.map((n, i) => ({ n, i })).filter(({ n }) => Math.floor(n.beat / 4) === bar)}
			<div class="flex items-center gap-1">
				<span class="w-14 shrink-0 text-xs font-bold text-ink-soft">{arranged.chords[bar].symbol}</span>
				<div class="flex flex-1 gap-0.5">
					{#each inBar as { n, i } (i)}
						{@const dim = v === 'B' && bar < 3 && n.beat >= bar * 4 + 3}
						{@const now = playing && player.mark === i}
						<span
							class="grid min-h-9 flex-1 place-items-center rounded-md border-2 border-ink text-[0.7rem] font-bold"
							style:flex-grow={n.dur * 2}
							style:background={dim ? 'var(--tomato)' : 'var(--card)'}
							style:color={dim ? 'var(--on-color)' : 'var(--ink)'}
							style:outline={now ? '3px solid var(--mustard)' : 'none'}
						>
							{n.pitch ? noteLabel(settings.labels, n.pitch, overChord(n.pitch, dim ? bar + 1 : bar), key.tonic) : ''}
						</span>
					{/each}
				</div>
				<span class="w-14 shrink-0 text-right text-xs font-bold" style:color="var(--tomato)">{v === 'B' && bar < 3 ? dims[bar] : ''}</span>
			</div>
		{/each}
	</div>

	{#snippet controls()}
		<HearButton {playing} loading={player.loading && player.isActive(id)} onclick={() => (playing ? player.stop() : player.play(source()))} />
		<ShuffleButton
			onclick={() => {
				const was = playing;
				deck.next();
				if (was) player.play(source());
			}}
			count={deck.label}
		/>
	{/snippet}
</WidgetCard>
