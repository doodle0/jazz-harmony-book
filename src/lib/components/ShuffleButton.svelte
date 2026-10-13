<script lang="ts">
	import { Dices } from '@lucide/svelte';
	import { t } from '#lib/messages/index.ts';

	let { onclick, count }: { onclick: () => void; count?: string } = $props();
	let spin = $state(0);
</script>

<button
	type="button"
	class="btn"
	style:background="var(--sky)"
	style:color="var(--on-color)"
	aria-label={t('play.shuffle')}
	onclick={() => {
		spin++;
		onclick();
	}}
>
	{#key spin}
		<span class="inline-flex" style:animation={spin ? 'wiggle 300ms ease' : ''}><Dices size={20} /></span>
	{/key}
	<span class="text-sm">{t('play.shuffle')}{count ? ` ${count}` : ''}</span>
</button>
