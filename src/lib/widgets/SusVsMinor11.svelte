<script lang="ts">
	// Sus vs -11 (guide §6, ch.7): the same two-hand shape with the left hand's lower
	// note switched between 4 (sus, no third) and ♭3 (-11). The piano names the one note
	// that changes.
	import data from '#lib/data/examples/sus-vs-minor11.json';
	import WidgetCard from '#lib/components/WidgetCard.svelte';
	import PianoKeys, { type KeyMark } from '#lib/components/PianoKeys.svelte';
	import ChordStrip from '#lib/components/ChordStrip.svelte';
	import Segmented from '#lib/components/Segmented.svelte';
	import HearButton from '#lib/components/HearButton.svelte';
	import ShuffleButton from '#lib/components/ShuffleButton.svelte';
	import { Deck, exampleSource } from '#lib/music/deck.svelte.ts';
	import { arrange, type Example } from '#lib/music/example.ts';
	import { player } from '#lib/stores/player.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { parseKey } from '#lib/theory/progression.ts';
	import { noteLabel } from '#lib/theory/labels.ts';

	const id = $props.id();
	const deck = new Deck(data.examples as Example[]);

	let which = $state<'sus' | 'm11'>('sus');
	let ex = $derived(deck.current);
	let key = $derived(player.keyFor(id, parseKey(ex.key), ex.id));
	let arranged = $derived(arrange(ex, { key, variant: which, voicing: 'spread' }));
	let playing = $derived(player.isPlaying(id));
	let voicing = $derived(arranged.voicings[0]);

	let marks = $derived.by(() => {
		const out: Record<number, KeyMark> = {};
		for (const n of voicing.notes) {
			const third = n.degree === '4' || n.degree === 'b3';
			out[n.midi] = {
				kind: third ? 'character' : /7$/.test(n.degree) ? 'chord' : 'tension',
				label: noteLabel(settings.labels, n.pitch, n.degree, key.tonic)
			};
		}
		return out;
	});
	let range = $derived.by(() => {
		const all = voicing.notes.map((n) => n.midi);
		return { low: Math.min(...all) - 2, high: Math.max(...all) + 2 };
	});

	function source() {
		return exampleSource(id, ex, { variant: which, voicing: 'spread' }, `${ex.variants?.[which]?.label} · ${ex.title}`);
	}
</script>

<WidgetCard title="sus와 -11" kicker="3도가 있나, 없나" color="var(--teal)" example={ex} summary={data.summary}>
	<Segmented
		label="코드"
		bind:value={which}
		onchange={() => player.update(source())}
		options={[
			{ value: 'sus', label: '7sus · 4도', color: 'var(--mustard)' },
			{ value: 'm11', label: '-11 · ♭3', color: 'var(--plum)' }
		]}
	/>
	<div class="mt-3 rounded-2xl border-2 border-ink bg-paper-2 p-2.5">
		<ChordStrip chords={arranged.chords} active={playing ? player.mark : -1} />
	</div>
	<p class="mt-2 text-sm" aria-live="polite">
		{#if which === 'sus'}
			3도 자리에 <b>4도</b>가 있어서 메이저도 마이너도 아닙니다. 해결을 기다리지 않고 떠 있는 소리예요.
		{:else}
			<b>♭3</b>이 들어와 마이너 코드가 됩니다. 11은 그대로 위에 남아 있어요.
		{/if}
	</p>
	<div class="mt-2">
		<PianoKeys low={range.low} high={range.high} {marks} names={{ character: which === 'sus' ? '4도 (sus)' : '♭3 (마이너)' }} onTap={(m) => player.tap('piano', [m])} />
	</div>

	{#snippet controls()}
		<HearButton {playing} loading={player.loading && player.isActive(id)} onclick={() => (playing ? player.stop() : player.play(source()))} />
		<ShuffleButton
			onclick={() => {
				const was = playing;
				deck.next();
				if (was) player.play(source());
			}}
			count={deck.label}
		/>
	{/snippet}
</WidgetCard>
