<script lang="ts">
	// Home-tone probe (ch.6.1): a passage that visits another key loops while the reader
	// holds one note on top: the old tonic, the new tonic, or nothing. At home the old
	// tonic sounds like rest; during the visit, if the new tonic is the one that rests,
	// the visit has become a tonicization.
	import WidgetCard from '#lib/components/WidgetCard.svelte';
	import ChordStrip from '#lib/components/ChordStrip.svelte';
	import Segmented from '#lib/components/Segmented.svelte';
	import HearButton from '#lib/components/HearButton.svelte';
	import ShuffleButton from '#lib/components/ShuffleButton.svelte';
	import { Deck, exampleSource } from '#lib/music/deck.svelte.ts';
	import { arrange, meterOf, type Example } from '#lib/music/example.ts';
	import { player } from '#lib/stores/player.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { parseKey, type Key } from '#lib/theory/progression.ts';
	import { degreeInterval, midiAtOrAbove, noteName, transpose } from '#lib/theory/pitch.ts';
	import type { NoteEv } from '#lib/audio/types.ts';

	interface ToneExample extends Example {
		/** the visited key's tonic as a degree of the home key */
		newHome: string;
		/** bars (0-based, inclusive) that sit in the visited key */
		visit: [number, number];
	}
	const prov = { status: 'generated', origin: 'ai', model: 'claude-opus-5-5/v1' } as const;
	const EXAMPLES: ToneExample[] = [
		{
			id: 'tone-bell',
			title: 'III으로 외출',
			tune: { title: 'If I Were a Bell', composer: 'Frank Loesser', year: 1950 },
			style: 'swing',
			key: 'F',
			tempo: 152,
			prog: 'I6 | IV7 | I6 | iiø7/vi V7/vi | vi-7 | iiø7/III V7/III | IIIΔ7 | ii-7 V7',
			newHome: '3',
			visit: [5, 6],
			provenance: prov
		},
		{
			id: 'tone-flat-three',
			title: '♭III에 세 마디',
			style: 'latin',
			key: 'E♭',
			tempo: 140,
			prog: 'IΔ7 | % | ii-7/♭III V7/♭III | ♭IIIΔ7 | vi-7/♭III | ii-7/♭III V7/♭III | ♭IIIΔ7 | ii-7 V7',
			newHome: 'b3',
			visit: [2, 6],
			provenance: prov
		}
	];

	const id = $props.id();
	const deck = new Deck(EXAMPLES);
	let top = $state<'none' | 'old' | 'new'>('old');

	let ex = $derived(deck.current as ToneExample);
	let key = $derived(player.keyFor(id, parseKey(ex.key), ex.id));
	let arranged = $derived(arrange(ex, { key, voicing: settings.voicing }));
	let playing = $derived(player.isPlaying(id));
	let oldHome = $derived(key.tonic);
	let newHome = $derived(transpose(key.tonic, degreeInterval(ex.newHome)));
	let bar = $derived(playing && player.mark >= 0 ? arranged.chords[player.mark].bar : -1);
	let away = $derived(bar >= ex.visit[0] && bar <= ex.visit[1]);
	let bars = $derived(Math.max(...arranged.chords.map((c) => c.bar)) + 1);

	/** the probe: one held note on top of every bar */
	function probe(k: Key, which: typeof top): NoteEv[] {
		if (which === 'none') return [];
		const p = which === 'old' ? k.tonic : transpose(k.tonic, degreeInterval(ex.newHome));
		const midi = midiAtOrAbove(p, 72);
		const meter = meterOf(ex);
		const n = Math.max(...arrange(ex, { key: k }).chords.map((c) => c.bar)) + 1;
		return Array.from({ length: n }, (_, b) => ({ beat: b * meter, dur: meter * 0.94, inst: 'vibes' as const, midi: [midi], vel: 0.62 }));
	}

	function source() {
		const which = top;
		const label = which === 'none' ? '위 음 없이' : which === 'old' ? '원래 집 음' : '새 집 음';
		return {
			...exampleSource(id, ex, { voicing: settings.voicing }),
			title: `${label} · ${ex.tune?.title ?? ex.title}`,
			build: (k: Key) => arrange(ex, { key: k, voicing: settings.voicing, extra: probe(k, which) }).seq
		};
	}
</script>

<WidgetCard
	title="어느 음이 쉬는 음일까"
	kicker="집 음 탐지기"
	color="var(--teal)"
	example={ex}
	summary="진행 위에 음 하나를 계속 얹어 둡니다. 집에서는 원래 집 음이 편안하게 들리죠. 외출 구간(초록)에서 새 집 음이 더 편안하게 들린다면, 그곳은 잠깐 들른 곳이 아니라 묵어 가는 집, 즉 으뜸음화입니다."
>
	<Segmented
		label="위에 얹을 음"
		size="sm"
		bind:value={top}
		onchange={() => player.update(source())}
		options={[
			{ value: 'old', label: `원래 집 음 (${noteName(oldHome)})` },
			{ value: 'new', label: `새 집 음 (${noteName(newHome)})`, color: 'var(--teal)' },
			{ value: 'none', label: '없음', color: 'var(--card)' }
		]}
	/>

	<div class="mt-3 grid grid-cols-4 gap-1 text-center text-xs font-bold" aria-hidden="true">
		{#each Array.from({ length: bars }, (_, b) => b) as b (b)}
			{@const out = b >= ex.visit[0] && b <= ex.visit[1]}
			<span
				class="rounded-md border-2 border-ink py-0.5"
				style:background={out ? 'var(--teal)' : 'var(--paper-2)'}
				style:color={out ? 'var(--on-color)' : 'var(--ink-soft)'}
				style:outline={b === bar ? '3px solid var(--mustard)' : 'none'}>{out ? `외출 (${noteName(newHome)})` : `집 (${noteName(oldHome)})`}</span
			>
		{/each}
	</div>
	<div class="mt-1 rounded-2xl border-2 border-ink bg-paper-2 p-2.5">
		<ChordStrip chords={arranged.chords} active={playing ? player.mark : -1} />
	</div>
	<p class="mt-2 text-sm" aria-live="polite">
		{#if !playing}
			▶를 누르고, 외출 구간이 올 때 위의 음을 바꿔 보세요.
		{:else if top === 'none'}
			위 음 없이 진행만 듣는 중입니다.
		{:else if away}
			지금은 <b>외출 중</b>. {top === 'old' ? `${noteName(oldHome)} 음이 아직 쉬는 음으로 들리나요, 아니면 걸리나요?` : `${noteName(newHome)} 음이 쉬는 음처럼 들리면 여기가 새 집입니다.`}
		{:else}
			지금은 <b>집</b>. {top === 'old' ? `${noteName(oldHome)} 음이 편안하게 들립니다.` : `${noteName(newHome)} 음은 집에서는 쉬는 음이 아닙니다.`}
		{/if}
	</p>

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
