<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Menu, Search, Settings2 } from '@lucide/svelte';
	import Sheet from '#lib/components/Sheet.svelte';
	import MiniPlayer from '#lib/components/MiniPlayer.svelte';
	import SettingsPanel from '#lib/components/SettingsPanel.svelte';
	import SearchPanel from '#lib/components/SearchPanel.svelte';
	import { CHAPTERS, chapterBySlug } from '#lib/chapters.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { progress } from '#lib/stores/progress.svelte.ts';
	import { prefetchAudio } from '#lib/stores/player.svelte.ts';
	import { t } from '#lib/messages/index.ts';

	let { children }: LayoutProps = $props();

	let tocOpen = $state(false);
	let settingsOpen = $state(false);
	let searchOpen = $state(false);

	let chapter = $derived(page.params.chapter ? chapterBySlug(page.params.chapter) : undefined);

	onMount(() => {
		settings.init();
		progress.init();
		// warm up the audio engine and the piano/bass samples on the first touch,
		// or after a short idle, so the first ▶ is instant
		let done = false;
		const warm = () => {
			if (done) return;
			done = true;
			prefetchAudio();
		};
		window.addEventListener('pointerdown', warm, { once: true });
		const idle = setTimeout(warm, 2500);
		return () => {
			clearTimeout(idle);
			window.removeEventListener('pointerdown', warm);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#f2b134" />
</svelte:head>

<header class="sticky top-0 z-20 border-b-[2.5px] border-ink bg-paper/90 backdrop-blur">
	<div class="mx-auto flex h-14 max-w-[640px] items-center gap-2 px-3">
		<button type="button" class="btn !min-h-11 !min-w-11 !px-0" aria-label={t('nav.toc')} onclick={() => (tocOpen = true)}>
			<Menu size={20} />
		</button>
		<a href={resolve('/')} class="min-w-0 flex-1 truncate text-center font-display text-lg leading-tight">
			{#if chapter}
				<span class="mr-1 rounded-full border-2 border-ink px-2 text-sm text-on-color" style:background={chapter.color}>{chapter.n}</span>
				{chapter.short}
			{:else}
				재즈 화성학 <span class="text-tomato">귀로</span> 배우기
			{/if}
		</a>
		<button type="button" class="btn !min-h-11 !min-w-11 !px-0" aria-label={t('nav.search')} onclick={() => (searchOpen = true)}>
			<Search size={20} />
		</button>
		<button type="button" class="btn !min-h-11 !min-w-11 !px-0" aria-label={t('nav.settings')} onclick={() => (settingsOpen = true)}>
			<Settings2 size={20} />
		</button>
	</div>
</header>

<main class="mx-auto max-w-[640px] px-4 pt-6 pb-36">
	{@render children()}
</main>

<MiniPlayer />

<Sheet bind:open={tocOpen} side="left" title={t('nav.toc')}>
	<nav aria-label={t('nav.toc')}>
		<a href={resolve('/')} class="mb-3 block font-bold text-teal underline" onclick={() => (tocOpen = false)}>← {t('nav.home')}</a>
		<ol class="space-y-2.5">
			{#each CHAPTERS as c (c.slug)}
				{@const here = chapter?.slug === c.slug}
				<li>
					<a
						href={resolve('/[chapter]', { chapter: c.slug })}
						class="flex items-center gap-3 rounded-2xl border-2 border-ink p-2.5 {here ? 'shadow-[3px_3px_0_var(--shadow)]' : ''}"
						style:background={here ? c.color : 'var(--card)'}
						onclick={() => (tocOpen = false)}
						aria-current={here ? 'page' : undefined}
					>
						<span class="grid size-10 shrink-0 place-items-center rounded-full border-2 border-ink text-lg" style:background={c.color}>{c.emoji}</span>
						<span class="min-w-0">
							<span class="block text-xs font-bold text-ink-soft {here ? '!text-on-color/80' : ''}">{c.n}장</span>
							<span class="block leading-snug font-bold {here ? 'text-on-color' : ''}">{c.short}</span>
						</span>
					</a>
				</li>
			{/each}
		</ol>
	</nav>
</Sheet>

<Sheet bind:open={settingsOpen} title={t('nav.settings')}>
	<SettingsPanel />
</Sheet>

<Sheet bind:open={searchOpen} title={t('nav.search')}>
	<SearchPanel onnavigate={() => (searchOpen = false)} />
</Sheet>
