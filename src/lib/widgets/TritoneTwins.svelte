<script lang="ts">
	// Tritone Twins (ch.3), two ideas kept apart:
	//  · twins: G Lydian dominant and D♭ altered are the same seven notes (D melodic minor),
	//    so V7(♯11) and subV7alt are one sound on two roots;
	//  · splice: on the SAME root, swapping halves of Lydian dominant and altered gives
	//    whole tone and half-whole diminished.
	import WidgetCard from '#lib/components/WidgetCard.svelte';
	import PianoKeys, { type KeyMark } from '#lib/components/PianoKeys.svelte';
	import ChordStrip from '#lib/components/ChordStrip.svelte';
	import Segmented from '#lib/components/Segmented.svelte';
	import HearButton from '#lib/components/HearButton.svelte';
	import { exampleSource } from '#lib/music/deck.svelte.ts';
	import { arrange, type Example } from '#lib/music/example.ts';
	import { player } from '#lib/stores/player.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { parseKey, type Key } from '#lib/theory/progression.ts';
	import { noteLabel } from '#lib/theory/labels.ts';
	import { degreeInterval, midiAtOrAbove, noteName, prettyDegree, simplify, transpose, type Pitch } from '#lib/theory/pitch.ts';
	import type { NoteEv } from '#lib/audio/types.ts';

	type Choice = 'lyd' | 'alt' | 'whole' | 'hw';
	const LYD = ['1', '2', '3', '#4', '5', '6', 'b7'];
	const ALT = ['1', 'b2', '#2', '3', 'b5', 'b6', 'b7'];
	// each degree tagged with the scale half it comes from
	const SCALES: Record<Choice, { name: string; chord: string; parts: { d: string; from: 'lyd' | 'alt' }[] }> = {
		lyd: { name: '리디안 도미넌트', chord: '7(9, ♯11, 13)', parts: LYD.map((d) => ({ d, from: 'lyd' })) },
		alt: { name: '얼터드', chord: '7alt', parts: ALT.map((d) => ({ d, from: 'alt' })) },
		whole: {
			name: '홀톤',
			chord: '+7(9, ♯11)',
			// lower 1 2 3 from Lydian dominant, upper ♭5 ♭6 ♭7 (= ♯4 ♯5 ♭7) from altered
			parts: [...LYD.slice(0, 3).map((d) => ({ d, from: 'lyd' as const })), ...['#4', '#5', 'b7'].map((d) => ({ d, from: 'alt' as const }))]
		},
		hw: {
			name: '하프-홀 디미니시드',
			chord: '7(♭9, 13)',
			parts: [...ALT.slice(0, 4).map((d) => ({ d, from: 'alt' as const })), ...LYD.slice(3).map((d) => ({ d, from: 'lyd' as const }))]
		}
	};

	const id = $props.id();
	const usual = parseKey('C');
	let view = $state<'twins' | 'splice'>('twins');
	let twin = $state<'lyd' | 'alt'>('lyd');
	let splice = $state<Choice>('whole');

	let key = $derived(player.keyFor(id, usual, view));
	let choice = $derived<Choice>(view === 'twins' ? twin : splice);
	let scale = $derived(SCALES[choice]);
	// twins: the altered twin sits on subV; everything else on V
	let onSub = $derived(view === 'twins' && twin === 'alt');

	function exampleFor(c: Choice, sub: boolean): Example {
		const v = sub ? `subV${SCALES[c].chord}` : `V${SCALES[c].chord}`;
		return {
			id: `twins-${c}-${sub}`,
			title: SCALES[c].name,
			style: 'swing',
			key: 'C',
			tempo: 126,
			prog: `ii-7 | ${v} | IΔ7 | %`,
			voicing: 'rootless',
			provenance: { status: 'generated', origin: 'ai' }
		};
	}

	function rootOf(k: Key, sub: boolean): Pitch {
		const V = transpose(k.tonic, degreeInterval('5'));
		return sub ? transpose(V, { steps: 4, semis: 6 }) : V;
	}

	function run(k: Key, c: Choice, sub: boolean): NoteEv[] {
		const low = midiAtOrAbove(rootOf(k, sub), 62);
		const line = [...SCALES[c].parts.map((p) => low + degreeInterval(p.d).semis), low + 12];
		return line.slice(0, 8).map((m, i) => ({ beat: 4 + i / 2, dur: 0.5, inst: 'vibes' as const, midi: [m], vel: i % 2 ? 0.55 : 0.7 }));
	}

	let ex = $derived(exampleFor(choice, onSub));
	let arranged = $derived(arrange(ex, { key }));
	let playing = $derived(player.isPlaying(id));
	let root = $derived(rootOf(key, onSub));
	// the melodic minor both twins come from: a fifth above the Lydian-dominant root
	let shared = $derived(noteName(transpose(rootOf(key, false), degreeInterval('5'))));

	let marks = $derived.by(() => {
		const out: Record<number, KeyMark> = {};
		// both twins show on the same keys, an octave from the V root
		const base = midiAtOrAbove(rootOf(key, false), 60);
		for (const p of scale.parts) {
			const pitch = simplify(transpose(root, degreeInterval(p.d)));
			let midi = midiAtOrAbove(pitch, base);
			if (midi >= base + 12) midi -= 12;
			out[midi] = {
				kind: p.d === '1' ? 'root' : view === 'twins' ? 'scale' : p.from === 'lyd' ? 'tension' : 'altered',
				label: noteLabel(settings.labels, pitch, p.d, key.tonic)
			};
		}
		return out;
	});

	function source() {
		const c = choice;
		const sub = onSub;
		return { ...exampleSource(id, exampleFor(c, sub)), content: view, title: SCALES[c].name, build: (k: Key) => arrange(exampleFor(c, sub), { key: k, extra: run(k, c, sub) }).seq };
	}
</script>

<WidgetCard
	title="트라이톤 쌍둥이"
	kicker="같은 음, 다른 근음 · 반쪽 잇기"
	color="var(--plum)"
	summary="쌍둥이: 근음만 트라이톤 옮겼는데 건반의 음은 그대로입니다. 반쪽 잇기: 같은 근음에서 두 스케일의 아래·위 절반을 바꿔 붙이면 새 스케일 두 개가 나옵니다."
>
	<Segmented
		label="보기"
		bind:value={view}
		onchange={() => player.update(source())}
		options={[
			{ value: 'twins', label: '쌍둥이 (근음이 다름)' },
			{ value: 'splice', label: '반쪽 잇기 (같은 근음)', color: 'var(--sky)' }
		]}
	/>
	<div class="mt-2">
		{#if view === 'twins'}
			<Segmented
				label="근음"
				size="sm"
				bind:value={twin}
				onchange={() => player.update(source())}
				options={[
					{ value: 'lyd', label: 'V 위: 리디안 도미넌트' },
					{ value: 'alt', label: 'subV 위: 얼터드', color: 'var(--tomato)' }
				]}
			/>
		{:else}
			<Segmented
				label="스케일"
				size="sm"
				bind:value={splice}
				onchange={() => player.update(source())}
				options={[
					{ value: 'lyd', label: '리디안 도미넌트', color: 'var(--sky)' },
					{ value: 'alt', label: '얼터드', color: 'var(--tomato)' },
					{ value: 'whole', label: '홀톤' },
					{ value: 'hw', label: '하프-홀' }
				]}
			/>
		{/if}
	</div>

	<div class="mt-3 flex flex-wrap gap-1 font-bold">
		{#each scale.parts as p (p.d)}
			<span
				class="grid min-w-8 place-items-center rounded-lg border-2 border-ink px-1 text-sm"
				style:background={view === 'twins' ? 'var(--card)' : p.from === 'lyd' ? 'var(--sky)' : 'var(--tomato)'}
				style:color={view === 'twins' ? 'var(--ink)' : 'var(--on-color)'}>{prettyDegree(p.d)}</span
			>
		{/each}
	</div>
	<p class="mt-2 text-sm" aria-live="polite">
		{#if view === 'twins'}
			<b>{noteName(root)} {scale.name}</b> = <b>{shared} 멜로딕 마이너</b>의 음들. 다른 쪽 쌍둥이로 바꿔도 건반의 음은 그대로예요.
		{:else if choice === 'whole'}
			리디안 도미넌트의 아래 <b>1 2 3</b> + 얼터드의 위 <b>♭5 ♭6 ♭7</b>(= ♯4 ♯5 ♭7) = 홀톤.
		{:else if choice === 'hw'}
			얼터드의 아래 <b>1 ♭2 ♯2 3</b> + 리디안 도미넌트의 위 <b>♯4 5 6 ♭7</b> = 하프-홀 디미니시드.
		{:else}
			{scale.name}: 파란 칸과 빨간 칸이 어디서 오는지 다른 버튼과 비교해 보세요.
		{/if}
	</p>

	<div class="mt-3 rounded-2xl border-2 border-ink bg-paper-2 p-2.5">
		<ChordStrip chords={arranged.chords} active={playing ? player.mark : 1} barsPerRow={2} />
	</div>
	<div class="mt-3">
		<PianoKeys
			low={midiAtOrAbove(rootOf(key, false), 60) - 1}
			high={midiAtOrAbove(rootOf(key, false), 60) + 12}
			{marks}
			names={{ tension: '리디안 도미넌트에서', altered: '얼터드에서', scale: '스케일' }}
			onTap={(m) => player.tap('vibes', [m])}
		/>
	</div>

	{#snippet controls()}
		<HearButton {playing} loading={player.loading && player.isActive(id)} onclick={() => (playing ? player.stop() : player.play(source()))} />
	{/snippet}
</WidgetCard>
