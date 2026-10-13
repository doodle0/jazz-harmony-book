<script lang="ts">
	import { resolve } from '$app/paths';
	import { CHAPTERS } from '#lib/chapters.ts';
	import { progress } from '#lib/stores/progress.svelte.ts';
	import { t } from '#lib/messages/index.ts';
	import { ArrowRight } from '@lucide/svelte';
</script>

<svelte:head>
	<title>{t('site.title')}</title>
	<meta name="description" content={t('site.subtitle')} />
</svelte:head>

<section class="relative mb-10">
	<!-- poster -->
	<div class="chunky relative overflow-hidden !bg-ink p-6 pb-8 text-paper" style:transform="rotate(-1.2deg)">
		<div class="absolute -top-14 -right-14 size-56 rounded-full border-[3px] border-paper/20 vinyl" aria-hidden="true">
			<div class="absolute inset-[38%] rounded-full border-2 border-ink bg-tomato"></div>
		</div>
		<div class="relative">
			<div class="mb-3 inline-block -rotate-2 rounded-md border-2 border-paper bg-mustard px-2 py-0.5 text-sm font-bold text-on-color">
				LIVE · 매일 밤 12키
			</div>
			<h1 class="font-display text-[2.6rem] leading-[1.08]">
				재즈 화성학,<br />
				<span class="text-mustard">귀로</span> 배우기
			</h1>
			<p class="mt-3 max-w-[22rem] text-paper/80">
				읽는 대신 <b class="text-paper">듣고, 바꾸고, 비교하세요.</b> 탭 한 번이면 모든 개념에서 소리가 납니다.
			</p>
			<div class="mt-5 flex flex-wrap gap-2 text-xs font-bold">
				<span class="rounded-full border-2 border-paper/60 px-2.5 py-1">🎺 스윙</span>
				<span class="rounded-full border-2 border-paper/60 px-2.5 py-1">🌴 보사노바</span>
				<span class="rounded-full border-2 border-paper/60 px-2.5 py-1">🌙 발라드</span>
				<span class="rounded-full border-2 border-paper/60 px-2.5 py-1">💃 왈츠</span>
				<span class="rounded-full border-2 border-paper/60 px-2.5 py-1">🪇 라틴</span>
			</div>
			<a href={resolve('/[chapter]', { chapter: 'function' })} class="btn mt-6 !bg-tomato text-lg !text-on-color">
				1장부터 듣기 <ArrowRight size={20} />
			</a>
		</div>
	</div>
	<p class="mt-5 px-1 text-sm leading-relaxed text-ink-soft">
		2026 재즈 화성학 클래스(<b class="text-ink">최지훈</b>)의 내용을 바탕으로 한 비상업 인터랙티브 교재입니다. 예시와 분석의 상당수는 AI가 만들고
		사람이 검토하는 중이에요.
	</p>
</section>

<h2 class="mb-4 font-display text-2xl">오늘의 셋리스트</h2>
<ol class="space-y-4">
	{#each CHAPTERS as c, i (c.slug)}
		{@const heard = progress.count(c.slug + ':')}
		<li>
			<a
				href={resolve('/[chapter]', { chapter: c.slug })}
				class="chunky ticket flex items-stretch overflow-hidden transition-transform active:translate-x-0.5 active:translate-y-0.5"
				style:transform="rotate({i % 2 ? 0.5 : -0.5}deg)"
			>
				<span class="grid w-16 shrink-0 place-items-center border-r-[2.5px] border-dashed border-ink font-display text-3xl text-on-color" style:background={c.color}>
					{c.n}
				</span>
				<span class="min-w-0 flex-1 p-3">
					<span class="block font-bold leading-snug">{c.emoji} {c.short}</span>
					<span class="block text-sm text-ink-soft">{c.blurb}</span>
				</span>
				{#if heard}
					<span class="self-center pr-3 text-sm font-bold text-teal" title={t('heard.label')}>✓{heard}</span>
				{/if}
			</a>
		</li>
	{/each}
</ol>

<style>
	.vinyl {
		background: repeating-radial-gradient(circle, #2b2520 0 2px, #1e1a16 2px 5px);
		animation: spin 9s linear infinite;
	}
</style>
