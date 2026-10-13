<script lang="ts">
	// Static full-text search with Pagefind. The index is generated after `vite build`,
	// so in dev this shows a hint instead.
	import { resolve } from '$app/paths';
	import { t } from '#lib/messages/index.ts';
	import { Search } from '@lucide/svelte';

	interface PagefindResult {
		url: string;
		meta: { title?: string };
		excerpt: string;
	}
	interface Pagefind {
		search: (q: string) => Promise<{ results: { data: () => Promise<PagefindResult> }[] }>;
	}

	let { onnavigate }: { onnavigate?: () => void } = $props();

	let q = $state('');
	let results = $state<PagefindResult[]>([]);
	let unavailable = $state(false);
	let pf: Promise<Pagefind> | null = null;

	function load(): Promise<Pagefind> {
		pf ??= import(/* @vite-ignore */ `${resolve('/')}pagefind/pagefind.js`) as Promise<Pagefind>;
		return pf;
	}

	let timer: ReturnType<typeof setTimeout>;
	function onInput() {
		clearTimeout(timer);
		timer = setTimeout(async () => {
			if (!q.trim()) {
				results = [];
				return;
			}
			try {
				const p = await load();
				const r = await p.search(q);
				results = await Promise.all(r.results.slice(0, 12).map((x) => x.data()));
			} catch {
				unavailable = true;
			}
		}, 180);
	}
</script>

<label class="flex items-center gap-2 rounded-full border-2 border-ink bg-paper-2 px-4 shadow-[3px_3px_0_var(--shadow)]">
	<Search size={18} />
	<!-- svelte-ignore a11y_autofocus -->
	<input
		bind:value={q}
		oninput={onInput}
		autofocus
		class="min-h-12 flex-1 bg-transparent outline-none"
		placeholder={t('search.placeholder')}
		aria-label={t('nav.search')}
	/>
</label>

{#if unavailable}
	<p class="mt-4 text-sm text-ink-soft">{t('search.devOnly')}</p>
{:else if q && results.length === 0}
	<p class="mt-4 text-sm text-ink-soft">{t('search.empty')}</p>
{/if}

<ul class="mt-4 space-y-3">
	{#each results as r (r.url)}
		<li>
			<a href={r.url} class="block rounded-2xl border-2 border-ink bg-card p-3 shadow-[3px_3px_0_var(--shadow)]" onclick={onnavigate}>
				<div class="font-bold">{r.meta.title}</div>
				<!-- pagefind excerpts contain <mark> highlights -->
				<div class="mt-1 text-sm text-ink-soft [&_mark]:bg-mustard [&_mark]:text-on-color">{@html r.excerpt}</div>
			</a>
		</li>
	{/each}
</ul>
