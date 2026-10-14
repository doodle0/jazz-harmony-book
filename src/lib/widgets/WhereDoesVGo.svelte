<script lang="ts">
	// V는 어디로 갈까? (ch.6.2 ear trainer): a ii-V plays and lands somewhere — home (I) or a
	// deceptive arrival (vi, iii, ♭VI). The reader names the arrival; rounds change key and
	// style, so the ear learns the function rather than one sound.
	import WidgetCard from '#lib/components/WidgetCard.svelte';
	import ChordStrip from '#lib/components/ChordStrip.svelte';
	import HearButton from '#lib/components/HearButton.svelte';
	import { exampleSource } from '#lib/music/deck.svelte.ts';
	import { arrange, STYLE_LABEL, type Example } from '#lib/music/example.ts';
	import { player } from '#lib/stores/player.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { allKeys, keyName, type Key } from '#lib/theory/progression.ts';
	import type { Style } from '#lib/audio/types.ts';

	const ARRIVALS = [
		{ roman: 'IΔ7', label: '집 (I)', explain: 'V7이 기대대로 I에 도착했습니다.' },
		{ roman: 'vi-7', label: '위종지: vi', explain: 'I 대신 vi-7. I과 공통음이 둘이라 "거의 집"처럼 들리지만 마이너로 어두워집니다.' },
		{ roman: 'iii-7', label: '위종지: iii', explain: 'I 대신 iii-7. 턴어라운드에서 가장 흔한 위종지예요(Misty).' },
		{ roman: '♭VIΔ7', label: '위종지: ♭VI', explain: 'I 대신 ♭VIΔ7. 근음이 반음 위로 올라가며 낯선 방으로 들어갑니다.' }
	];
	const FEELS: { style: Style; tempo: number }[] = [
		{ style: 'swing', tempo: 132 },
		{ style: 'ballad', tempo: 66 },
		{ style: 'bossa', tempo: 126 },
		{ style: 'waltz', tempo: 150 },
		{ style: 'latin', tempo: 140 }
	];
	const KEYS = allKeys(false);

	const id = $props.id();
	let round = $state({ n: 0, answer: 2, key: KEYS[5], feel: FEELS[0] });
	let pick = $state<number | null>(null);
	/** which arrival the chart shows after answering: the question's, or home for comparison */
	let shown = $state(2);
	let score = $state({ right: 0, total: 0 });

	function exampleFor(ans: number): Example {
		const r = round;
		return {
			id: `where-v-${r.n}-${ans}`,
			title: 'V는 어디로 갈까?',
			style: r.feel.style,
			key: 'C',
			tempo: r.feel.tempo,
			prog: `ii-7 | V7 | ${ARRIVALS[ans].roman} | %`,
			provenance: { status: 'generated', origin: 'ai' }
		};
	}

	let ex = $derived(exampleFor(pick === null ? round.answer : shown));
	let arranged = $derived(arrange(ex, { key: round.key, voicing: settings.voicing }));
	let playing = $derived(player.isPlaying(id));

	function play(ans: number) {
		shown = ans;
		const e = exampleFor(ans);
		player.play({ ...exampleSource(id, e, { voicing: settings.voicing }), content: e.id, usualKey: round.key, title: pick === null ? '어디에 도착할까요?' : ARRIVALS[ans].label }, { loop: false });
	}

	function choose(i: number) {
		if (pick !== null) return;
		pick = i;
		shown = round.answer;
		score = { right: score.right + (i === round.answer ? 1 : 0), total: score.total + 1 };
	}

	function next() {
		player.stop();
		pick = null;
		const n = round.n + 1;
		round = { n, answer: Math.floor(Math.random() * ARRIVALS.length), key: KEYS[Math.floor(Math.random() * 12)], feel: FEELS[n % FEELS.length] };
	}
</script>

<WidgetCard title="V는 어디로 갈까?" kicker="귀로 맞히기" color="var(--plum)" summary="ii-V가 끝나면 어디에 도착하는지 듣고 고르세요. 키와 스타일이 매번 바뀌니, 소리 하나가 아니라 기능을 듣게 됩니다.">
	<p class="text-sm text-ink-soft">{STYLE_LABEL[round.feel.style]} · {keyName(round.key)} 키 · {round.n + 1}번째 문제</p>
	<div class="mt-2 rounded-2xl border-2 border-ink bg-paper-2 p-2.5">
		{#if pick === null}
			<div class="grid grid-cols-4 gap-1 text-center font-bold">
				<span class="rounded-lg border-2 border-ink bg-card py-2">{arranged.chords[0].symbol}</span>
				<span class="rounded-lg border-2 border-ink bg-card py-2">{arranged.chords[1].symbol}</span>
				<span class="col-span-2 rounded-lg border-2 border-dashed border-ink py-2 text-ink-soft">?</span>
			</div>
		{:else}
			<ChordStrip chords={arranged.chords} active={playing ? player.mark : -1} />
		{/if}
	</div>

	<div class="mt-3 grid grid-cols-2 gap-2">
		{#each ARRIVALS as a, i (i)}
			{@const state = pick === null ? 'idle' : i === round.answer ? 'right' : i === pick ? 'wrong' : 'idle'}
			<button
				type="button"
				class="min-h-11 rounded-2xl border-2 border-ink px-2 py-2 text-sm font-bold"
				style:background={state === 'right' ? 'var(--leaf)' : state === 'wrong' ? 'var(--tomato)' : 'var(--card)'}
				style:color={state === 'idle' ? 'var(--ink)' : 'var(--on-color)'}
				disabled={pick !== null}
				onclick={() => choose(i)}
			>
				{a.label}
			</button>
		{/each}
	</div>
	{#if pick !== null}
		<p class="mt-3 rounded-xl bg-paper-2 px-3 py-2 text-sm leading-relaxed" aria-live="polite">
			<b>{pick === round.answer ? '맞았어요!' : '아쉬워요.'}</b>
			{ARRIVALS[round.answer].explain}
		</p>
		{#if round.answer !== 0}
			<div class="mt-2 flex flex-wrap gap-2">
				<button type="button" class="btn text-sm" aria-pressed={shown === 0} onclick={() => play(0)}>비교: 집(I)으로 갔다면</button>
				<button type="button" class="btn text-sm" aria-pressed={shown === round.answer} onclick={() => play(round.answer)}>문제의 진행 다시 듣기</button>
			</div>
			{#if shown === 0}<p class="mt-1 text-xs text-ink-soft">위 차트는 지금 집(I)으로 간 버전입니다.</p>{/if}
		{/if}
	{/if}

	{#snippet controls()}
		<HearButton {playing} loading={player.loading && player.isActive(id)} onclick={() => (playing ? player.stop() : play(pick === null ? round.answer : shown))} />
		<button type="button" class="btn" onclick={next}>다음 문제 →</button>
		<span class="ml-auto text-sm font-bold text-ink-soft">{score.right}/{score.total}</span>
	{/snippet}
</WidgetCard>
