<script lang="ts">
	// ★ 6th-Diminished Harmonizer (guide §4): short original melodies in the bebop major
	// scale, harmonized note by note as block chords. Chord tones of I6 get an I6 voicing,
	// the passing notes get viio7, with the melody on top. Close or drop 2; piano, sax soli
	// or brass. The rhythm section keeps only bass and drums.
	import WidgetCard from '#lib/components/WidgetCard.svelte';
	import Segmented from '#lib/components/Segmented.svelte';
	import HearButton from '#lib/components/HearButton.svelte';
	import ShuffleButton from '#lib/components/ShuffleButton.svelte';
	import PianoKeys, { type KeyMark } from '#lib/components/PianoKeys.svelte';
	import { Deck, exampleSource } from '#lib/music/deck.svelte.ts';
	import { arrange, type Example } from '#lib/music/example.ts';
	import { parseLine, type LineNote } from '#lib/music/line.ts';
	import { player } from '#lib/stores/player.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { parseKey, type Key } from '#lib/theory/progression.ts';
	import { formatChord } from '#lib/theory/format.ts';
	import { noteLabel } from '#lib/theory/labels.ts';
	import { degreeInterval, pc, transpose } from '#lib/theory/pitch.ts';
	import type { Inst, NoteEv } from '#lib/audio/types.ts';

	const SIXTH = ['1', '3', '5', '6'];
	const DIM = ['7', '2', '4', '#5'];
	const prov = { status: 'generated', origin: 'ai', model: 'claude-opus-5-5/v1' } as const;
	// original melodies, bebop major scale only (every note belongs to I6 or viio7)
	const MELODY: Record<string, string> = {
		'sixdim-swing': '5 6 ^1 ^2 ^3:1 ^2 ^1 | 6 #5 6 7 ^1:2 | ^3 ^2 ^1 7 6 #5 5 4 | 3:3 r:1',
		'sixdim-ballad': '3:1 4 #5 6:2 | 5:1 #5 6 7:1 ^1:1 | ^2:1 ^1 7 6:1 #5 5 | 6:3 r:1',
		'sixdim-bossa': '^1:1.5 7 6:1 5:1 | 4 3 2 3 5:2 | 6:1.5 #5 6 ^1 7 6 | 5:4'
	};
	const EXAMPLES: Example[] = [
		{ id: 'sixdim-swing', title: '미디엄 스윙 (오리지널 멜로디)', style: 'swing', key: 'C', tempo: 126, prog: 'I6 | % | % | %', provenance: prov },
		{ id: 'sixdim-ballad', title: '발라드 (오리지널 멜로디)', style: 'ballad', key: 'F', tempo: 66, prog: 'I6 | % | % | %', provenance: prov },
		{ id: 'sixdim-bossa', title: '보사노바 (오리지널 멜로디)', style: 'bossa', key: 'E♭', tempo: 124, prog: 'I6 | % | % | %', provenance: prov }
	];
	const INST: Record<string, { inst: Inst; label: string }> = {
		piano: { inst: 'piano', label: '피아노 블록' },
		sax: { inst: 'sax', label: '색소폰 솔리' },
		brass: { inst: 'brass', label: '브라스' }
	};

	const id = $props.id();
	const deck = new Deck(EXAMPLES);
	let spacing = $state<'close' | 'drop2'>('close');
	let sound = $state<keyof typeof INST>('piano');

	let ex = $derived(deck.current);
	let key = $derived(player.keyFor(id, parseKey(ex.key), ex.id));
	let playing = $derived(player.isPlaying(id));

	interface Block {
		note: LineNote;
		midi: number[];
		chord: 'sixth' | 'dim';
	}

	/** Melody on top (moved into C5–A5), the other three chord notes packed right below it. */
	function harmonize(k: Key, exId: string, how: 'close' | 'drop2'): Block[] {
		const line = parseLine(MELODY[exId], k.tonic, 60);
		const sounding = line.filter((n) => n.midi !== null).map((n) => n.midi!);
		let shift = 0;
		while (Math.max(...sounding) + shift > 81) shift -= 12;
		while (Math.min(...sounding) + shift < 64) shift += 12;
		return line
			.filter((n) => n.midi !== null)
			.map((n) => {
				const set = SIXTH.includes(n.degree!) ? SIXTH : DIM;
				const top = n.midi! + shift;
				const i = set.indexOf(n.degree!);
				const below: number[] = [];
				let prev = top;
				for (let j = 1; j <= 3; j++) {
					const d = set[(i - j + 4) % 4];
					const target = pc(transpose(k.tonic, degreeInterval(d)));
					let m = prev - 1;
					while (((m % 12) + 12) % 12 !== target) m--;
					below.push(m);
					prev = m;
				}
				// drop 2: the second voice from the top goes down an octave
				if (how === 'drop2') below[0] -= 12;
				return { note: { ...n, midi: top }, midi: [top, ...below].sort((a, b) => a - b), chord: set === SIXTH ? 'sixth' : 'dim' };
			});
	}

	let blocks = $derived(harmonize(key, ex.id, spacing));
	let names = $derived({
		sixth: formatChord({ root: key.tonic, quality: 'maj6', tensions: [] }),
		dim: formatChord({ root: transpose(key.tonic, degreeInterval('7')), quality: 'dim7', tensions: [] })
	});
	let shown = $derived(playing && player.mark >= 0 ? player.mark : 0);
	let marks = $derived.by(() => {
		const out: Record<number, KeyMark> = {};
		const b = blocks[shown];
		if (!b) return out;
		const top = Math.max(...b.midi);
		for (const m of b.midi) out[m] = { kind: m === top ? 'melody' : b.chord === 'sixth' ? 'chord' : 'tritone' };
		return out;
	});

	function build(k: Key, how: 'close' | 'drop2', inst: Inst) {
		const bs = harmonize(k, ex.id, how);
		const band = arrange(ex, { key: k }).seq;
		band.notes = band.notes.filter((n) => n.inst === 'bass' || n.inst === 'ebass');
		const legato = inst === 'piano' ? 0.9 : 0.97;
		const blockNotes: NoteEv[] = bs.map((b) => ({ beat: b.note.beat, dur: b.note.dur * legato, inst, midi: b.midi, vel: Number.isInteger(b.note.beat) ? 0.72 : 0.62 }));
		band.notes.push(...blockNotes);
		band.marks = bs.map((b, i) => ({ beat: b.note.beat, index: i }));
		return band;
	}

	function source() {
		const how = spacing;
		const inst = INST[sound].inst;
		return { ...exampleSource(id, ex), title: `${INST[sound].label} · ${how === 'close' ? '클로즈' : '드랍 2'}`, build: (k: Key) => build(k, how, inst) };
	}
	const refresh = () => player.update(source());
</script>

<WidgetCard
	title="6th 디미니시드 블록 코드"
	kicker="멜로디 한 음에 코드 하나"
	color="var(--sky)"
	example={ex}
	summary="멜로디가 {names.sixth}의 음이면 {names.sixth}, 아니면 {names.dim}. 그 원리 하나로 모든 음에 코드가 붙습니다. 클로즈와 드랍 2, 악기를 바꿔 가며 들어 보세요."
>
	<div class="flex flex-wrap gap-2">
		<Segmented
			label="간격"
			size="sm"
			bind:value={spacing}
			onchange={refresh}
			options={[
				{ value: 'close', label: '클로즈' },
				{ value: 'drop2', label: '드랍 2', color: 'var(--plum)' }
			]}
		/>
		<Segmented label="악기" size="sm" bind:value={sound} onchange={refresh} options={Object.entries(INST).map(([value, o]) => ({ value, label: o.label }))} />
	</div>

	<div class="mt-3 flex flex-wrap gap-1">
		{#each blocks as b, i (i)}
			{@const now = playing && player.mark === i}
			<span
				class="grid min-h-11 min-w-9 place-items-center rounded-lg border-2 border-ink px-1 text-xs font-bold leading-tight"
				style:background={b.chord === 'sixth' ? 'var(--leaf)' : 'var(--plum)'}
				style:color="var(--on-color)"
				style:outline={now ? '3px solid var(--mustard)' : 'none'}
			>
				<span>{noteLabel(settings.labels, b.note.pitch!, b.note.degree!, key.tonic)}</span>
				<span class="text-[0.6rem] font-normal">{b.chord === 'sixth' ? names.sixth : names.dim}</span>
			</span>
		{/each}
	</div>
	<div class="mt-3">
		<PianoKeys low={52} high={84} {marks} names={{ melody: '멜로디', chord: names.sixth, tritone: names.dim }} onTap={(m) => player.tap('piano', [m])} />
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
