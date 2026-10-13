<script lang="ts">
	import { resolve } from '$app/paths';
	import { ArrowLeft, ArrowRight } from '@lucide/svelte';
	import { t } from '#lib/messages/index.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let Content = $derived(data.content);
</script>

<svelte:head>
	<title>{data.info.n}. {data.info.short} · {t('site.title')}</title>
</svelte:head>

<article data-pagefind-body>
	<div class="relative mb-8">
		<div
			class="chunky relative overflow-hidden p-5 pb-6"
			style:background={data.info.color}
			style:transform="rotate(-1deg)"
		>
			<div class="flex items-center gap-3 text-on-color">
				<span class="grid size-14 place-items-center rounded-full border-[2.5px] border-ink bg-card font-display text-3xl text-ink">{data.info.n}</span>
				<span class="text-4xl" aria-hidden="true">{data.info.emoji}</span>
			</div>
			<h1 class="mt-3 font-display text-[1.85rem] leading-tight break-keep text-on-color">{data.info.title}</h1>
			<p class="mt-1 font-bold text-on-color/80">{data.info.blurb}</p>
			<div aria-hidden="true" class="absolute -right-6 -bottom-8 text-[7rem] leading-none opacity-15 select-none">♫</div>
		</div>
	</div>

	<div class="prose">
		<Content />
	</div>
</article>

<nav class="mt-14 grid grid-cols-2 gap-3" aria-label="장 이동">
	{#if data.prev}
		<a href={resolve('/[chapter]', { chapter: data.prev.slug })} class="chunky flex flex-col gap-1 p-3 !shadow-[3px_3px_0_var(--shadow)]">
			<span class="flex items-center gap-1 text-xs font-bold text-ink-soft"><ArrowLeft size={14} /> {t('nav.prev')}</span>
			<span class="font-bold leading-snug">{data.prev.emoji} {data.prev.short}</span>
		</a>
	{:else}<span></span>{/if}
	{#if data.next}
		<a href={resolve('/[chapter]', { chapter: data.next.slug })} class="chunky flex flex-col items-end gap-1 p-3 text-right !shadow-[3px_3px_0_var(--shadow)]">
			<span class="flex items-center gap-1 text-xs font-bold text-ink-soft">{t('nav.next')} <ArrowRight size={14} /></span>
			<span class="font-bold leading-snug">{data.next.emoji} {data.next.short}</span>
		</a>
	{/if}
</nav>
