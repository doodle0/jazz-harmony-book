<script lang="ts">
	// ★ Scale Chooser drill (ch.3): a progression with one dominant marked; the reader picks
	// a scale for it and hears that scale run over the chord, right or wrong. It starts with
	// the chapter's three priority scales and opens up to all seven.
	import WidgetCard from '#lib/components/WidgetCard.svelte';
	import ChordStrip from '#lib/components/ChordStrip.svelte';
	import Segmented from '#lib/components/Segmented.svelte';
	import HearButton from '#lib/components/HearButton.svelte';
	import { exampleSource } from '#lib/music/deck.svelte.ts';
	import { arrange, STYLE_LABEL, type Example } from '#lib/music/example.ts';
	import { DOMINANT_SCALES } from '#lib/theory/scales.ts';
	import { player } from '#lib/stores/player.svelte.ts';
	import { allKeys, keyName, type Key } from '#lib/theory/progression.ts';
	import { degreeInterval, midiAtOrAbove } from '#lib/theory/pitch.ts';
	import type { NoteEv, Style } from '#lib/audio/types.ts';

	interface Item {
		prog: string;
		/** index of the chord to choose a scale for */
		target: number;
		answer: string;
		/** other scales that also count as right */
		also?: string[];
		/** why a particular wrong pick clashes */
		why?: Record<string, string>;
		explain: string;
	}

	const BASIC: Item[] = [
		{ prog: 'ii-7 | V7 | IΔ7 | %', target: 1, answer: 'mixolydian', also: ['lydian-dominant'], explain: '메이저로 가는 평범한 V7입니다. 9와 13이 밝게 울리는 믹솔리디안이 기본이에요.' },
		{ prog: 'ii-7 | V7alt | IΔ7 | %', target: 1, answer: 'altered', explain: '코드 심벌이 7alt라고 말하고 있습니다: ♭9, ♯9, ♭5, ♭13을 전부 가진 얼터드.' },
		{ prog: 'iiø7 | V7(♭9, ♭13) | i-6 | %', target: 1, answer: 'phrygian-dominant', also: ['altered'], explain: '마이너로 가는 V7입니다. ♭9와 ♭13이 그대로 마이너 키의 음이라 프리지안 도미넌트가 기본이에요.' },
		{ prog: 'IΔ7 | V7(♭9, ♭13)/vi | vi-7 | %', target: 1, answer: 'phrygian-dominant', also: ['altered'], explain: '세컨더리 도미넌트는 목표 키로 생각하세요. 목표 vi-7이 마이너이니 프리지안 도미넌트입니다.' },
		{ prog: 'IΔ7 | V7/IV | IVΔ7 | %', target: 1, answer: 'mixolydian', explain: '목표 IVΔ7이 메이저이니 믹솔리디안입니다. I이 잠깐 도미넌트가 된 모양이에요.' }
	];
	const MORE: Item[] = [
		{
			prog: 'ii-7 | subV7(♯11) | IΔ7 | %',
			target: 1,
			answer: 'lydian-dominant',
			explain: '♯11이 적혀 있고, 트라이톤 대체 도미넌트에는 리디안 도미넌트가 기본입니다.',
			why: { 'whole-tone': '홀톤에도 ♯11은 있지만 5도 대신 ♯5를 씁니다. 이 코드는 13(♮)을 함께 치므로 ♯5가 13과 반음으로 부딪칩니다. 홀톤은 +7처럼 ♯5가 적힌 코드에 쓰세요.' }
		},
		{ prog: 'IΔ7 | V7(♯11)/V | ii-7 | V7', target: 1, answer: 'lydian-dominant', explain: 'The Girl from Ipanema의 II7(♯11). ♯11이 반짝이는 리디안 도미넌트입니다.' },
		{ prog: 'ii-7 | V+7 | IΔ7 | %', target: 1, answer: 'whole-tone', explain: '+7은 ♯5를 가진 도미넌트. 9, ♯11, ♯5가 모두 들어 있는 홀톤이 떠다니는 소리를 냅니다.' },
		{ prog: 'ii-7 | V7(♭9, 13) | IΔ7 | %', target: 1, answer: 'half-whole', explain: '♭9와 ♮13이 함께 있는 건 하프-홀 디미니시드뿐입니다(얼터드는 ♭13).' },
		{ prog: 'ii-7 | V7(♭13) | i-6 | %', target: 1, answer: 'aeolian-dominant', also: ['phrygian-dominant'], explain: '♮9에 ♭13: 에이올리안 도미넌트. 마이너 쪽으로 기울지만 ♭9보다 덜 어둡습니다.' }
	];
	const STYLES: { style: Style; tempo: number }[] = [
		{ style: 'swing', tempo: 132 },
		{ style: 'bossa', tempo: 124 },
		{ style: 'ballad', tempo: 66 },
		{ style: 'latin', tempo: 140 },
		{ style: 'hard-bop', tempo: 120 }
	];
	const KEYS = allKeys(false);
	const BASIC_IDS = ['mixolydian', 'altered', 'phrygian-dominant'];

	const id = $props.id();
	let level = $state<'basic' | 'all'>('basic');
	let round = $state(0);
	let pick = $state<string | null>(null);
	let score = $state({ right: 0, total: 0 });

	let pool = $derived(level === 'basic' ? BASIC : [...BASIC, ...MORE]);
	let choices = $derived(DOMINANT_SCALES.filter((s) => level === 'all' || BASIC_IDS.includes(s.id)));
	// a fixed walk through items, keys and styles, so every round differs
	let item = $derived(pool[(round * 7) % pool.length]);
	let key = $derived<Key>(KEYS[(round * 5 + 3) % 12]);
	let feel = $derived(STYLES[round % STYLES.length]);
	let ex = $derived<Example>({
		id: `scale-drill-${round}`,
		title: '스케일 고르기',
		style: feel.style,
		key: 'C',
		tempo: feel.tempo,
		prog: item.prog,
		voicing: 'rootless',
		provenance: { status: 'generated', origin: 'ai' }
	});
	let shown = $derived(player.keyFor(id, key, ex.id));
	let arranged = $derived(arrange(ex, { key: shown }));
	let playing = $derived(player.isPlaying(id));
	let right = $derived(pick !== null && (pick === item.answer || !!item.also?.includes(pick)));

	function run(k: Key, sid: string): NoteEv[] {
		const s = DOMINANT_SCALES.find((x) => x.id === sid)!;
		const c = arrange(ex, { key: k }).chords[item.target];
		const low = midiAtOrAbove(c.chord.root, 62);
		const line = [...s.degrees.map((d) => low + degreeInterval(d).semis), low + 12];
		return line.slice(0, 8).map((m, i) => ({ beat: c.start + i / 2, dur: 0.5, inst: 'vibes' as const, midi: [m], vel: i % 2 ? 0.55 : 0.7 }));
	}

	function source(sid: string | null) {
		const name = sid ? DOMINANT_SCALES.find((s) => s.id === sid)!.name : '스케일 없이';
		return {
			...exampleSource(id, ex),
			usualKey: key,
			title: `${arranged.chords[item.target].symbol} = ${name}`,
			build: (k: Key) => arrange(ex, { key: k, extra: sid ? run(k, sid) : [] }).seq
		};
	}

	function choose(sid: string) {
		const first = pick === null;
		pick = sid;
		if (first) score = { right: score.right + (right ? 1 : 0), total: score.total + 1 };
		player.play(source(sid));
	}

	function next() {
		round++;
		pick = null;
		player.stop();
	}
</script>

<WidgetCard title="스케일 고르기" kicker="연습" color="var(--plum)" summary="노란 칸의 도미넌트에 어떤 스케일을 쓸까요? 고르면 그 스케일이 코드 위에서 울립니다. 틀린 답도 들려주니, 왜 어색한지 귀로 확인해 보세요.">
	<Segmented
		label="스케일 범위"
		size="sm"
		bind:value={level}
		onchange={next}
		options={[
			{ value: 'basic', label: '먼저 세 가지' },
			{ value: 'all', label: '일곱 가지 전부', color: 'var(--plum)' }
		]}
	/>
	<p class="mt-3 text-sm text-ink-soft">{STYLE_LABEL[feel.style]} · {keyName(shown)} 키</p>
	<div class="mt-1 rounded-2xl border-2 border-ink bg-paper-2 p-2.5">
		<ChordStrip chords={arranged.chords} active={playing && player.mark >= 0 ? player.mark : item.target} />
	</div>

	<div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
		{#each choices as s (s.id)}
			{@const isPick = pick === s.id}
			{@const isAnswer = pick !== null && (s.id === item.answer || !!item.also?.includes(s.id))}
			<button
				type="button"
				class="min-h-11 rounded-2xl border-2 border-ink p-2 text-left text-sm font-bold transition-all"
				style:background={isAnswer ? 'var(--leaf)' : isPick ? 'var(--tomato)' : 'var(--card)'}
				style:color={isAnswer || isPick ? 'var(--on-color)' : 'var(--ink)'}
				aria-pressed={isPick}
				onclick={() => choose(s.id)}
			>
				{s.name}
				<span class="block text-xs font-normal opacity-80">V{s.chord}</span>
			</button>
		{/each}
	</div>
	{#if pick}
		<p class="mt-3 rounded-xl bg-paper-2 px-3 py-2 text-sm leading-relaxed" aria-live="polite">
			<b>{right ? '좋아요!' : '다시 들어 보세요.'}</b>
			{#if !right && item.why?.[pick]}{item.why[pick]}{' '}{/if}{item.explain}
		</p>
	{/if}

	{#snippet controls()}
		<HearButton {playing} loading={player.loading && player.isActive(id)} onclick={() => (playing ? player.stop() : player.play(source(pick)))} />
		<button type="button" class="btn" onclick={next}>다음 문제 →</button>
		<span class="ml-auto text-sm font-bold text-ink-soft">{score.right}/{score.total}</span>
	{/snippet}
</WidgetCard>
