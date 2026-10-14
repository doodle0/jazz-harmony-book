<script lang="ts">
	import { untrack } from 'svelte';
	// A/B (or A/B/C) for one harmonic device: the same passage before and after the
	// device, switchable while it plays, across examples in different styles.
	import WidgetCard from '#lib/components/WidgetCard.svelte';
	import ChordStrip from '#lib/components/ChordStrip.svelte';
	import Segmented from '#lib/components/Segmented.svelte';
	import HearButton from '#lib/components/HearButton.svelte';
	import ShuffleButton from '#lib/components/ShuffleButton.svelte';
	import { Deck, exampleSource } from '#lib/music/deck.svelte.ts';
	import { arrange, type ExampleSet } from '#lib/music/example.ts';
	import { player } from '#lib/stores/player.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { parseKey } from '#lib/theory/progression.ts';

	const sets = import.meta.glob<ExampleSet>('../data/examples/*.json', { eager: true, import: 'default' });

	let { set: setId, color = 'var(--leaf)', kicker = 'A/B 비교' }: { set: string; color?: string; kicker?: string } = $props();

	const id = $props.id();
	// the set is fixed for the widget's lifetime
	const wanted = untrack(() => setId);
	const data = Object.values(sets).find((s) => s.concept === wanted);
	if (!data) throw new Error(`No example set "${wanted}"`);
	const deck = new Deck(data.examples);

	let ex = $derived(deck.current);
	let variantKeys = $derived(Object.keys(ex.variants ?? {}));
	let variant = $state('B');
	let v = $derived(variantKeys.includes(variant) ? variant : variantKeys[variantKeys.length - 1]);
	let key = $derived(player.keyFor(id, parseKey(ex.key), ex.id));
	let arranged = $derived(arrange(ex, { key, variant: v, voicing: settings.voicing }));
	let playing = $derived(player.isPlaying(id));

	const COLORS = ['var(--sky)', 'var(--tomato)', 'var(--plum)'];

	function source() {
		return exampleSource(id, ex, { variant: v, voicing: settings.voicing }, `${ex.tune?.title ?? ex.title} · ${ex.variants?.[v]?.label ?? ''}`);
	}

	function pick(next: string) {
		variant = next;
		player.update(source());
	}

	function shuffle() {
		const was = playing;
		deck.next();
		if (was) player.play(source());
	}
</script>

<WidgetCard title={data.title} {kicker} {color} example={ex} summary={data.summary}>
	<Segmented
		label="버전"
		value={v}
		onchange={pick}
		options={variantKeys.map((k, i) => ({ value: k, label: `${k} · ${ex.variants![k].label}`, color: COLORS[i] }))}
	/>
	<div class="mt-3 rounded-2xl border-2 border-ink bg-paper-2 p-2.5">
		<ChordStrip chords={arranged.chords} active={playing ? player.mark : -1} />
	</div>
	{#if ex.note}<p class="mt-2 text-sm text-ink-soft">💬 {ex.note}</p>{/if}

	{#snippet controls()}
		<HearButton {playing} loading={player.loading && player.isActive(id)} onclick={() => (playing ? player.stop() : player.play(source()))} />
		<ShuffleButton onclick={shuffle} count={deck.label} />
	{/snippet}
</WidgetCard>
