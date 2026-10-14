<script lang="ts">
	// ★ Same Song, Any Key (guide §1): the letters change, the Roman numerals don't.
	import data from '#lib/data/examples/same-song.json';
	import WidgetCard from '#lib/components/WidgetCard.svelte';
	import ChordStrip from '#lib/components/ChordStrip.svelte';
	import Segmented from '#lib/components/Segmented.svelte';
	import HearButton from '#lib/components/HearButton.svelte';
	import ShuffleButton from '#lib/components/ShuffleButton.svelte';
	import { Deck, exampleSource } from '#lib/music/deck.svelte.ts';
	import { arrange, type Example } from '#lib/music/example.ts';
	import { player } from '#lib/stores/player.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { allKeys, keyShortName, parseKey, sameKey, type Key } from '#lib/theory/progression.ts';

	let { start = 'all-of-me-a' }: { start?: string } = $props();

	const id = $props.id();
	const deck = new Deck(data.examples as Example[]);
	deck.i = Math.max(0, deck.examples.findIndex((e) => e.id === start));

	let show = $state<'letters' | 'roman' | 'both'>('both');
	let ex = $derived(deck.current);
	let usual = $derived(parseKey(ex.key));
	let key = $derived(player.keyFor(id, usual, ex.id));
	let arranged = $derived(arrange(ex, { key, voicing: settings.voicing }));
	let playing = $derived(player.isPlaying(id));

	// the lecture's three keys for All of Me, otherwise usual key ± a few
	let quickKeys = $derived.by(() => {
		const keys = allKeys(usual.minor);
		const at = (pc: number) => keys[pc];
		if (ex.id === 'all-of-me-a') return [keys[0], keys[7], keys[8]];
		const i = keys.findIndex((k) => sameKey(k, usual));
		return [at(i), at((i + 5) % 12), at((i + 8) % 12)];
	});

	function source() {
		return exampleSource(id, ex, { voicing: settings.voicing });
	}

	function playIn(k: Key) {
		if (playing) player.setKey(k);
		else player.play(source(), { key: k });
	}

	function randomKey() {
		const keys = allKeys(usual.minor).filter((k) => !sameKey(k, key));
		playIn(keys[Math.floor(Math.random() * keys.length)]);
	}

	function shuffle() {
		const was = playing;
		deck.next();
		if (was) player.play(source());
		else player.stop();
	}
</script>

<WidgetCard
	title="같은 곡, 어느 키로든"
	kicker="키 바꿔 듣기"
	color="var(--mustard)"
	example={ex}
	summary="키를 바꾸면 알파벳 코드명은 전부 바뀌지만, 아래의 로마 숫자는 그대로입니다. 귀가 알아듣는 건 로마 숫자 쪽이에요."
>
	<div class="mb-3 flex flex-wrap items-center gap-2">
		<span class="text-sm font-bold text-ink-soft">키</span>
		{#each quickKeys as k (keyShortName(k))}
			{@const on = sameKey(k, key)}
			<button
				type="button"
				class="btn !min-h-11 !px-3.5 text-lg"
				style:background={on ? 'var(--mustard)' : 'var(--card)'}
				aria-pressed={on}
				onclick={() => playIn(k)}
			>
				{keyShortName(k)}
				{#if sameKey(k, usual)}<span class="text-[0.65rem] text-ink-soft">원키</span>{/if}
			</button>
		{/each}
		<button type="button" class="btn !min-h-11 text-sm" onclick={randomKey}>🎲 아무 키</button>
	</div>

	<div class="rounded-2xl border-2 border-ink bg-paper-2 p-2.5">
		<ChordStrip chords={arranged.chords} active={playing ? player.mark : -1} {show} />
	</div>

	<div class="mt-3">
		<Segmented
			label="라벨"
			size="sm"
			bind:value={show}
			options={[
				{ value: 'letters', label: '알파벳' },
				{ value: 'roman', label: '로마 숫자' },
				{ value: 'both', label: '둘 다' }
			]}
		/>
	</div>
	{#if ex.note}<p class="mt-2 text-sm text-ink-soft">💬 {ex.note}</p>{/if}

	{#snippet controls()}
		<HearButton {playing} loading={player.loading && player.isActive(id)} onclick={() => (playing ? player.stop() : player.play(source()))} />
		<ShuffleButton onclick={shuffle} count={deck.label} />
	{/snippet}
</WidgetCard>
