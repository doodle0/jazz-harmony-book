<script lang="ts" module>
	export interface QuizHear {
		prog: string;
		key?: string;
		style?: import('#lib/audio/types.ts').Style;
		tempo?: number;
	}
	export interface QuizQuestion {
		/** choice: pick one; reveal: think, then show the answer */
		kind: 'choice' | 'reveal';
		q: string;
		/** a sound that belongs to the question (its chords stay hidden until answered) */
		hear?: QuizHear;
		options?: string[];
		/** choice: index of the right option; reveal: the answer text */
		answer: number | string;
		explain?: string;
	}
	export interface QuizSet {
		id: string;
		questions: QuizQuestion[];
	}
</script>

<script lang="ts">
	// Self-check (plan §9.0): 2–3 questions per chapter with hidden answers. A question
	// can carry a sound ("이건 무슨 장치?"). First tries are kept locally, separate from
	// the "들어봤어요" listening checkmarks.
	import { untrack } from 'svelte';
	import WidgetCard from './WidgetCard.svelte';
	import Hear from '#lib/widgets/Hear.svelte';
	import { progress } from '#lib/stores/progress.svelte.ts';

	const sets = import.meta.glob<QuizSet>('../data/quizzes/*.json', { eager: true, import: 'default' });

	let { id: setId }: { id: string } = $props();
	const wanted = untrack(() => setId);
	const data = Object.values(sets).find((s) => s.id === wanted);
	if (!data) throw new Error(`No quiz "${wanted}"`);

	let picked = $state<Record<number, number>>({});
	let shown = $state<Record<number, boolean>>({});

	const qid = (i: number) => `${data.id}:${i}`;
	let right = $derived(data.questions.filter((_, i) => progress.quiz[qid(i)] === true).length);
	let done = $derived(data.questions.filter((_, i) => qid(i) in progress.quiz).length);

	function pick(i: number, o: number) {
		if (picked[i] !== undefined) return;
		picked = { ...picked, [i]: o };
		progress.answer(qid(i), o === data!.questions[i].answer);
	}

	function reveal(i: number) {
		shown = { ...shown, [i]: true };
		progress.answer(qid(i), true);
	}

	function retry() {
		picked = {};
		shown = {};
		progress.resetQuiz(`${data!.id}:`);
	}
</script>

<WidgetCard title="확인 문제" kicker="이해했는지 확인하기" color="var(--mustard)">
	<ol class="space-y-5">
		{#each data.questions as item, i (i)}
			{@const chosen = picked[i]}
			<li>
				<p class="font-bold"><span class="mr-1 text-ink-soft">Q{i + 1}.</span>{item.q}</p>
				{#if item.hear}
					<div class="mt-2">
						<Hear prog={item.hear.prog} key={item.hear.key} style={item.hear.style} tempo={item.hear.tempo} label="문제 {i + 1} 듣기" />
					</div>
				{/if}
				{#if item.kind === 'choice'}
					<div class="mt-2 grid gap-2">
						{#each item.options ?? [] as opt, o (o)}
							{@const isAnswer = o === item.answer}
							{@const state = chosen === undefined ? 'idle' : isAnswer ? 'right' : chosen === o ? 'wrong' : 'idle'}
							<button
								type="button"
								class="min-h-11 rounded-2xl border-2 border-ink px-3 py-2 text-left text-sm font-semibold transition-all"
								class:opacity-60={chosen !== undefined && state === 'idle'}
								style:background={state === 'right' ? 'var(--leaf)' : state === 'wrong' ? 'var(--tomato)' : 'var(--card)'}
								style:color={state === 'idle' ? 'var(--ink)' : 'var(--on-color)'}
								disabled={chosen !== undefined}
								onclick={() => pick(i, o)}
							>
								{#if state === 'right'}✓ {:else if state === 'wrong'}✗ {/if}{opt}
							</button>
						{/each}
					</div>
					{#if chosen !== undefined && item.explain}
						<p class="mt-2 rounded-xl bg-paper-2 px-3 py-2 text-sm leading-relaxed" aria-live="polite">
							<b>{chosen === item.answer ? '맞았어요.' : '아쉬워요.'}</b>
							{item.explain}
						</p>
					{/if}
				{:else if shown[i]}
					<p class="mt-2 rounded-xl bg-paper-2 px-3 py-2 text-sm leading-relaxed" aria-live="polite">
						<b>답:</b>
						{item.answer}
						{#if item.explain}<br />{item.explain}{/if}
					</p>
				{:else}
					<button type="button" class="btn mt-2 text-sm" onclick={() => reveal(i)}>먼저 생각해 보고, 답 보기</button>
				{/if}
			</li>
		{/each}
	</ol>

	{#snippet controls()}
		<span class="text-sm font-bold text-ink-soft">{done}/{data.questions.length} 풀었어요{#if done}, 첫 시도에 {right}개 정답{/if}</span>
		{#if done}
			<button type="button" class="btn ml-auto text-sm" onclick={retry}>다시 풀기</button>
		{/if}
	{/snippet}
</WidgetCard>
