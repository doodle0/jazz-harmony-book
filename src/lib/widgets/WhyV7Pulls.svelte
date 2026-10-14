<script lang="ts">
	// ★ Why V7 pulls (guide §1): A/B of V → I vs V7 → I. The tritone (3rd + 7th of V7)
	// glows on the piano, then resolves: 3rd up a half step, 7th down a half step.
	import data from '#lib/data/examples/why-v7.json';
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
	import { degreeInterval, noteName, solfege, transpose } from '#lib/theory/pitch.ts';
	import { Hand } from '@lucide/svelte';

	const id = $props.id();
	const deck = new Deck(data.examples as Example[]);
	// keep the voices inside the keyboard shown below (E3–E5)
	const voiceOptions = { low: 53, high: 64 };

	let variant = $state<'V' | 'V7'>('V7');
	let holding = $state(false);

	let ex = $derived(deck.current);
	let key = $derived(player.keyFor(id, parseKey(ex.key), ex.id));
	let arranged = $derived(arrange(ex, { key, variant, voiceOptions }));
	let playing = $derived(player.isPlaying(id));
	let shown = $derived(playing && player.mark >= 0 ? player.mark : holding ? 0 : -1);
	let current = $derived(shown >= 0 ? arranged.chords[shown] : arranged.chords[0]);
	let isTonic = $derived(current.roman.startsWith('I'));

	let marks = $derived.by(() => {
		const out: Record<number, KeyMark> = {};
		const idx = shown >= 0 ? shown : 0;
		const voicing = arranged.voicings[idx];
		const chord = arranged.chords[idx];
		for (const n of voicing.notes) {
			const label = noteLabel(settings.labels, n.pitch, n.degree, key.tonic);
			let kind: KeyMark['kind'] = n.degree === '1' ? 'root' : 'chord';
			if (!chord.roman.startsWith('I') && variant === 'V7' && (n.degree === '3' || n.degree === 'b7')) kind = 'tritone';
			if (chord.roman.startsWith('I') && (n.degree === '1' || n.degree === '3')) kind = 'resolve';
			out[n.midi] = { kind, label };
		}
		return out;
	});

	// B → C and F → E, in the current key
	let resolution = $derived.by(() => {
		const V = transpose(key.tonic, degreeInterval('5'));
		const third = transpose(V, degreeInterval('3'));
		const seventh = transpose(V, degreeInterval('b7'));
		const tonic = key.tonic;
		const tonicThird = transpose(key.tonic, degreeInterval('3'));
		const fmt = (p: typeof V) => `${noteName(p)}(${solfege(p, key.tonic)})`;
		return [
			{ from: fmt(third), to: fmt(tonic), dir: '↗' },
			{ from: fmt(seventh), to: fmt(tonicThird), dir: '↘' }
		];
	});

	function source() {
		return exampleSource(id, ex, { variant, voiceOptions });
	}

	function toggle() {
		holding = false;
		if (playing) player.stop();
		else player.play(source());
	}

	function pick(v: 'V' | 'V7') {
		variant = v;
		holding = false;
		player.update(source());
	}

	function hold() {
		holding = true;
		// hold whichever dominant is selected, so the keyboard and the sound agree
		const held: Example = { ...ex, style: 'pad', prog: `${variant} | %`, variants: undefined };
		player.play({ ...exampleSource(id, held, { voiceOptions }), title: `${variant}에서 멈추기…` }, { loop: false });
	}

	function shuffle() {
		const wasPlaying = playing;
		holding = false;
		deck.next();
		if (wasPlaying) player.play(source());
	}
</script>

<WidgetCard
	title="V7은 왜 집으로 가고 싶어 할까"
	kicker="A/B 듣기"
	color="var(--tomato)"
	example={ex}
	summary="V와 V7을 번갈아 들어 보세요. V7에는 3도와 7도 사이에 트라이톤이 있어서, 해결될 때 3도는 반음 올라가고 7도는 반음 내려갑니다."
>
	<div class="mb-3 flex items-center justify-between gap-2">
		<Segmented
			label="V 또는 V7"
			value={variant}
			options={[
				{ value: 'V', label: 'V (3화음)', color: 'var(--sky)' },
				{ value: 'V7', label: 'V7', color: 'var(--plum)' }
			]}
			onchange={pick}
		/>
		<span class="font-display text-3xl" class:animate-[wiggle_0.5s_ease_infinite]={!isTonic && variant === 'V7' && (playing || holding)}>
			{isTonic && playing ? '🏠' : variant === 'V7' ? '😬' : '🙂'}
		</span>
	</div>

	<ChordStrip chords={arranged.chords} active={playing ? player.mark : -1} />

	<div class="mt-3">
		<PianoKeys low={52} high={76} {marks} onTap={(m) => player.tap('piano', [m])} />
	</div>

	{#if variant === 'V7'}
		<div class="mt-3 flex flex-wrap gap-2 text-sm">
			{#each resolution as r (r.from)}
				<span
					class="rounded-full border-2 border-ink px-3 py-1 font-bold transition-colors"
					style:background={isTonic && playing ? 'var(--mustard)' : 'var(--paper-2)'}
				>
					{r.from}
					{r.dir}
					{r.to}
				</span>
			{/each}
		</div>
	{/if}

	{#snippet controls()}
		<HearButton playing={playing && !holding} loading={player.loading && player.isActive(id)} onclick={toggle} />
		<button type="button" class="btn" style:background="var(--plum)" style:color="var(--on-color)" onclick={hold}>
			<Hand size={18} /> {variant}에서 멈추기
		</button>
		<ShuffleButton onclick={shuffle} count={deck.label} />
	{/snippet}
</WidgetCard>
