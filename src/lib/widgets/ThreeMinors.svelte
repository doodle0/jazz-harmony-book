<script lang="ts">
	// Three Minors (guide §3): one iv – v – i in natural, harmonic and melodic minor.
	// Raising the 7th turns v-7 into a real V7; raising the 6th as well removes the
	// augmented 2nd and turns iv-7 into IV7. Both raised-7th scales end on i-Δ7. A vibes run plays the scale over the V bar.
	import data from '#lib/data/examples/three-minors.json';
	import WidgetCard from '#lib/components/WidgetCard.svelte';
	import PianoKeys, { type KeyMark } from '#lib/components/PianoKeys.svelte';
	import ChordStrip from '#lib/components/ChordStrip.svelte';
	import Segmented from '#lib/components/Segmented.svelte';
	import HearButton from '#lib/components/HearButton.svelte';
	import ShuffleButton from '#lib/components/ShuffleButton.svelte';
	import { Deck, exampleSource } from '#lib/music/deck.svelte.ts';
	import { arrange, type Example } from '#lib/music/example.ts';
	import { player } from '#lib/stores/player.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { parseKey, type Key } from '#lib/theory/progression.ts';
	import { noteLabel } from '#lib/theory/labels.ts';
	import { degreeInterval, midiAtOrAbove, prettyDegree, transpose } from '#lib/theory/pitch.ts';
	import type { NoteEv } from '#lib/audio/types.ts';

	type Kind = 'natural' | 'harmonic' | 'melodic';
	const SCALES: Record<Kind, { degrees: string[]; color: string; text: string }> = {
		natural: {
			degrees: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
			color: 'var(--sky)',
			text: '메이저 스케일의 6번째 모드. v-7에는 이끎음이 없어서 i로 끌어당기는 힘이 약합니다.'
		},
		harmonic: {
			degrees: ['1', '2', 'b3', '4', '5', 'b6', '7'],
			color: 'var(--tomato)',
			text: '7음을 올려 진짜 V7이 생기고, 토닉도 i-Δ7이 됩니다. 대신 ♭6과 7 사이에 증2도가 남아 "스파이시한" 소리가 납니다. 실제 곡에서는 V7만 올린 7음을 빌리고 토닉은 i-6나 i-7로 두는 경우가 많습니다(§1의 마이너 ii-V-i).'
		},
		melodic: {
			degrees: ['1', '2', 'b3', '4', '5', '6', '7'],
			color: 'var(--plum)',
			text: '6음까지 올려 증2도를 없앱니다. 아래는 마이너, 위는 메이저: iv-7이 IV7로 바뀝니다. 토닉 i-Δ7은 하모닉과 같습니다.'
		}
	};
	const NATURAL = SCALES.natural.degrees;

	const id = $props.id();
	const deck = new Deck(data.examples as Example[]);

	let kind = $state<Kind>('harmonic');
	let ex = $derived(deck.current);
	let usual = $derived(parseKey(ex.key));
	let key = $derived(player.keyFor(id, usual, ex.id));
	let scale = $derived(SCALES[kind]);
	// notes that differ from natural minor
	let raised = $derived(new Set(scale.degrees.filter((d) => !NATURAL.includes(d))));

	/** an 8th-note run up the scale, from the tonic, over the V bar */
	function run(k: Key, which: Kind, start: number): NoteEv[] {
		const low = midiAtOrAbove(k.tonic, 62);
		const line = [...SCALES[which].degrees.map((d) => low + degreeInterval(d).semis), low + 12];
		return line.map((m, i) => ({ beat: start + i / 2, dur: i === line.length - 1 ? 1.4 : 0.5, inst: 'vibes' as const, midi: [m], vel: i % 2 ? 0.55 : 0.68 }));
	}

	function build(k: Key, which: Kind) {
		const opts = { key: k, variant: which, voicing: settings.voicing };
		const chords = arrange(ex, opts).chords;
		const v = chords.find((c, i) => i > 0 && c.symbol !== chords[0].symbol) ?? chords[0];
		return arrange(ex, { ...opts, extra: run(k, which, v.start) }).seq;
	}

	let arranged = $derived(arrange(ex, { key, variant: kind, voicing: settings.voicing }));
	let playing = $derived(player.isPlaying(id));

	let marks = $derived.by(() => {
		const out: Record<number, KeyMark> = {};
		const low = midiAtOrAbove(key.tonic, 60);
		for (const d of scale.degrees) {
			out[low + degreeInterval(d).semis] = {
				kind: d === '1' ? 'root' : raised.has(d) ? 'character' : 'chord',
				label: noteLabel(settings.labels, transpose(key.tonic, degreeInterval(d)), d, key.tonic)
			};
		}
		return out;
	});

	function source() {
		const which = kind;
		return { ...exampleSource(id, ex, { variant: which, voicing: settings.voicing }), title: `${ex.variants?.[which]?.label} · ${ex.title}`, build: (k: Key) => build(k, which) };
	}

	function shuffle() {
		const was = playing;
		deck.next();
		if (was) player.play(source());
	}
</script>

<WidgetCard
	title="세 가지 마이너"
	kicker="내추럴 · 하모닉 · 멜로딕"
	color="var(--plum)"
	example={ex}
	summary="같은 마이너 키에서 6음과 7음만 바꿔 보세요. 7음을 올리면 V7이, 6음까지 올리면 IV7이 생깁니다."
>
	<Segmented
		label="마이너 스케일"
		size="sm"
		bind:value={kind}
		onchange={() => player.update(source())}
		options={[
			{ value: 'natural', label: '내추럴', color: SCALES.natural.color },
			{ value: 'harmonic', label: '하모닉', color: SCALES.harmonic.color },
			{ value: 'melodic', label: '멜로딕', color: SCALES.melodic.color }
		]}
	/>

	<div class="mt-3 flex flex-wrap gap-1 font-bold">
		{#each scale.degrees as d (d)}
			<span class="grid min-w-8 place-items-center rounded-lg border-2 border-ink px-1 text-sm" style:background={raised.has(d) ? 'var(--mustard)' : 'var(--card)'}>{prettyDegree(d)}</span>
		{/each}
	</div>
	<p class="mt-2 text-sm">{scale.text}</p>

	<div class="mt-3 rounded-2xl border-2 border-ink bg-paper-2 p-2.5">
		<ChordStrip chords={arranged.chords} active={playing ? player.mark : -1} barsPerRow={2} />
	</div>
	<div class="mt-3">
		<PianoKeys low={midiAtOrAbove(key.tonic, 60) - 2} high={midiAtOrAbove(key.tonic, 60) + 13} {marks} onTap={(m) => player.tap('vibes', [m])} />
	</div>

	{#snippet controls()}
		<HearButton {playing} loading={player.loading && player.isActive(id)} onclick={() => (playing ? player.stop() : player.play(source()))} />
		<ShuffleButton onclick={shuffle} count={deck.label} />
	{/snippet}
</WidgetCard>
