<script lang="ts">
	import { Play, Square, LoaderCircle } from '@lucide/svelte';
	import { t } from '#lib/messages/index.ts';

	let {
		playing = false,
		loading = false,
		label = t('play.hear'),
		onclick
	}: { playing?: boolean; loading?: boolean; label?: string; onclick: () => void } = $props();
</script>

<button
	type="button"
	class="btn !px-5 text-base"
	style:background={playing ? 'var(--ink)' : 'var(--tomato)'}
	style:color={playing ? 'var(--paper)' : 'var(--on-color)'}
	aria-pressed={playing}
	{onclick}
>
	{#if loading}
		<LoaderCircle size={20} class="animate-[spin_0.9s_linear_infinite]" />
		<span class="text-sm">{t('play.loading')}</span>
	{:else if playing}
		<Square size={18} fill="currentColor" />
		{t('play.stop')}
	{:else}
		<Play size={20} fill="currentColor" />
		{label}
	{/if}
</button>
