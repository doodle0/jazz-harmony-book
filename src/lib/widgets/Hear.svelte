<script lang="ts">
	// Inline "hear this" pill for a progression written in the prose:
	// <Hear prog="ii-7 V7 | IΔ7" key="C" style="swing" />
	// `stack` fixes the voicing as degrees from the bass up: stack="1 5 9 13 3 7 ♯11"
	import { Play, Square } from '@lucide/svelte';
	import type { Style } from '#lib/audio/types.ts';
	import { exampleSource } from '#lib/music/deck.svelte.ts';
	import { arrange, type Example } from '#lib/music/example.ts';
	import { player } from '#lib/stores/player.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { parseKey } from '#lib/theory/progression.ts';

	let {
		prog,
		key = 'C',
		style = 'swing',
		tempo = 120,
		label,
		stack
	}: { prog: string; key?: string; style?: Style; tempo?: number; label?: string; stack?: string } = $props();

	const id = $props.id();
	let ex = $derived<Example>({
		id,
		title: label ?? prog,
		style,
		key,
		tempo,
		prog,
		stack,
		provenance: { status: 'generated', origin: 'ai' }
	});
	let shownKey = $derived(player.keyFor(id, parseKey(key)));
	let chords = $derived(arrange(ex, { key: shownKey }).chords);
	let playing = $derived(player.isPlaying(id));
	let text = $derived(
		chords
			.filter((c, i) => i === 0 || c.symbol !== chords[i - 1].symbol)
			.map((c) => c.symbol)
			.join(' – ')
	);
</script>

<button
	type="button"
	class="not-prose mx-0.5 inline-flex max-w-full items-center gap-1.5 rounded-full border-2 border-ink px-2.5 py-0.5 align-middle text-[0.9rem] font-bold shadow-[2px_2px_0_var(--shadow)] transition-transform active:translate-x-px active:translate-y-px"
	style:background={playing ? 'var(--mustard)' : 'var(--card)'}
	onclick={() => (playing ? player.stop() : player.play({ ...exampleSource(id, ex, { voicing: settings.voicing }), title: label ?? text }, { loop: false }))}
	aria-label="{label ?? text} 듣기"
>
	<span class="grid size-5 shrink-0 place-items-center rounded-full bg-tomato text-on-color">
		{#if playing}<Square size={9} fill="currentColor" />{:else}<Play size={10} fill="currentColor" />{/if}
	</span>
	<span class="truncate">{label ?? text}</span>
</button>
