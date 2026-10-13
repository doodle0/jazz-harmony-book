<script lang="ts">
	// "들어봤어요" checkmark at the end of a section, stored locally.
	import { progress } from '#lib/stores/progress.svelte.ts';
	import { t } from '#lib/messages/index.ts';

	let { id }: { id: string } = $props();
	let on = $derived(!!progress.heard[id]);
</script>

<div class="not-prose my-6 flex justify-end">
	<button
		type="button"
		class="btn text-sm"
		style:background={on ? 'var(--leaf)' : 'var(--card)'}
		style:color={on ? 'var(--on-color)' : 'var(--ink-soft)'}
		aria-pressed={on}
		onclick={() => progress.toggle(id)}
	>
		<span class="grid size-6 place-items-center rounded-full border-2 border-current" style:animation={on ? 'pop 300ms ease' : ''}>{on ? '✓' : ''}</span>
		{t('heard.label')}
	</button>
</div>
