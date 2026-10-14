<script lang="ts">
	// ★ ii-V-I Voicing Explorer (guide §1): major/minor, A / B / alternating A-B, for either
	// root-position shells (A = 1-3-7, B = 1-7-3) or four-note rootless voicings.
	// The ladder shows every voice moving by step; the ø7 ninth toggle plays the
	// textbook ♭9 (an avoid note) against the ♮9.
	import data from '#lib/data/examples/ii-v-i.json';
	import WidgetCard from '#lib/components/WidgetCard.svelte';
	import PianoKeys, { type KeyMark } from '#lib/components/PianoKeys.svelte';
	import VoiceLadder from '#lib/components/VoiceLadder.svelte';
	import Segmented from '#lib/components/Segmented.svelte';
	import HearButton from '#lib/components/HearButton.svelte';
	import ShuffleButton from '#lib/components/ShuffleButton.svelte';
	import { Deck, exampleSource } from '#lib/music/deck.svelte.ts';
	import { arrange, type Example } from '#lib/music/example.ts';
	import { player } from '#lib/stores/player.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { parseKey, type Key } from '#lib/theory/progression.ts';
	import { noteLabel } from '#lib/theory/labels.ts';
	import type { VoicingStyle } from '#lib/theory/voicing.ts';

	let { mode: initialMode = 'major', kind = 'rootless' }: { mode?: 'major' | 'minor'; kind?: 'rootless' | 'shell' } = $props();

	const id = $props.id();
	const deck = new Deck(data.examples as Example[]);
	// open on medium swing rather than the ballad
	deck.i = Math.max(0, deck.examples.findIndex((e) => e.id === 'iivi-swing'));
	// svelte-ignore state_referenced_locally
	const shell = kind === 'shell';

	// svelte-ignore state_referenced_locally
	let mode = $state<'major' | 'minor'>(initialMode);
	let form = $state<'A' | 'B' | 'alternate'>('alternate');
	let ninth = $state<'none' | 'b9' | '9'>('none');

	let ex = $derived(deck.current);
	let usual = $derived.by(() => {
		const k = parseKey(ex.key);
		return { tonic: k.tonic, minor: mode === 'minor' } satisfies Key;
	});
	let key = $derived(player.keyFor(id, usual, ex.id));
	let opts = $derived({
		variant: mode,
		voicing: form as VoicingStyle,
		voiceOptions: shell
			? // the root sits in the left hand, so keep it in the bass register and drop the bass player
				{ family: 'shell' as const, startForm: 'A' as const, low: 41, high: 52 }
			: { halfDimNinth: ninth, startForm: mode === 'minor' ? ('B' as const) : ('A' as const) },
		bass: !shell
	});
	let arranged = $derived(arrange(ex, { ...opts, key }));
	let playing = $derived(player.isPlaying(id));
	let shown = $derived(playing && player.mark >= 0 ? player.mark : 0);
	let shownForm = $derived(arranged.voicings[shown].form);

	let marks = $derived.by(() => {
		const out: Record<number, KeyMark> = {};
		for (const n of arranged.voicings[shown].notes) {
			const guide = /^(b?3|b{0,2}7|6)$/.test(n.degree);
			const avoid = n.degree === 'b9' && arranged.chords[shown].chord.quality === 'halfDim7';
			out[n.midi] = {
				kind: avoid ? 'avoid' : n.degree === '1' ? 'root' : guide ? 'chord' : 'tension',
				label: noteLabel(settings.labels, n.pitch, n.degree, key.tonic)
			};
		}
		return out;
	});

	function source() {
		return { ...exampleSource(id, ex, opts), usualKey: usual };
	}

	function refresh() {
		player.update(source());
	}

	function shuffle() {
		const was = playing;
		deck.next();
		if (was) player.play(source());
	}
</script>

<WidgetCard
	title={shell ? '셸 보이싱 ii-V-I' : 'ii-V-I 보이싱 탐험기'}
	kicker={shell ? '근음 + 3도 + 7도' : '근음 없는 4음 보이싱'}
	color={shell ? 'var(--sky)' : 'var(--teal)'}
	example={ex}
	summary={shell
		? '1-3-7과 1-7-3을 번갈아 쓰면 3도와 7도가 제자리에 머물거나 반음 내려가며 다음 코드로 이어집니다. 3도와 7도가 위아래로 자리를 바꾸는 이 움직임이 가이드톤 라인입니다.'
		: 'A → B → A로 번갈아 쓰면 모든 성부가 반음이나 온음으로만 움직입니다. 각 코드의 7도가 반음 내려가 다음 코드의 3도가 되는 것도 찾아보세요.'}
>
	<div class="flex flex-wrap gap-2">
		<Segmented
			label="장조/단조"
			size="sm"
			bind:value={mode}
			onchange={refresh}
			options={[
				{ value: 'major', label: '메이저 ii-V-I' },
				{ value: 'minor', label: '마이너 ii-V-i', color: 'var(--plum)' }
			]}
		/>
		<Segmented
			label="보이싱"
			size="sm"
			bind:value={form}
			onchange={refresh}
			options={[
				{ value: 'A', label: shell ? 'A 폼 (1-3-7)' : 'A 폼' },
				{ value: 'B', label: shell ? 'B 폼 (1-7-3)' : 'B 폼' },
				{ value: 'alternate', label: mode === 'minor' && !shell ? 'B·A·B 교대' : 'A·B·A 교대' }
			]}
		/>
		{#if mode === 'minor' && !shell}
			<Segmented
				label="iiø7의 9도"
				size="sm"
				bind:value={ninth}
				onchange={refresh}
				options={[
					{ value: 'none', label: '9 없음 (정석)' },
					{ value: 'b9', label: '♭9 (기피음)', color: 'var(--tomato)' },
					{ value: '9', label: '♮9 (모던)', color: 'var(--sky)' }
				]}
			/>
		{/if}
	</div>

	<div class="mt-3 rounded-2xl border-2 border-ink bg-paper-2 p-2">
		<VoiceLadder
			chords={arranged.chords}
			voicings={arranged.voicings}
			active={playing ? player.mark : -1}
			labelOf={(c, j) => {
				const n = arranged.voicings[c].notes[j];
				return noteLabel(settings.labels, n.pitch, n.degree, key.tonic);
			}}
		/>
	</div>

	<div class="mt-3 flex items-center gap-2 text-sm font-bold" aria-live="polite">
		<span class="font-display text-lg">{arranged.chords[shown].symbol}</span>
		{#if shownForm}
			<span class="rounded-full border-2 border-ink px-2.5 py-0.5" style:background={shownForm === 'A' ? 'var(--mustard)' : 'var(--sky)'} style:color="var(--on-color)">
				{shownForm} 폼
			</span>
			<span class="text-ink-soft">{shownForm === 'A' ? '3도가 7도보다 아래' : '7도가 3도보다 아래'}</span>
		{/if}
	</div>
	<div class="mt-2">
		<PianoKeys low={shell ? 40 : 45} high={shell ? 64 : 74} {marks} onTap={(m) => player.tap('piano', [m])} />
	</div>

	{#snippet controls()}
		<HearButton {playing} loading={player.loading && player.isActive(id)} onclick={() => (playing ? player.stop() : player.play(source()))} />
		<ShuffleButton onclick={shuffle} count={deck.label} />
	{/snippet}
</WidgetCard>
