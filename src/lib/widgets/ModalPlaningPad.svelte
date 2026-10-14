<script lang="ts">
	// ★ Modal Planing Pad (guide §6, ch.7): over a modal drone, one shape (So What, or a
	// stack of fourths) slides through the mode. Eight two-beat slots; pick a slot, then a
	// scale degree to put the shape there. The bass stays; only the shape moves.
	// All patterns are original voicings, not transcriptions.
	import WidgetCard from '#lib/components/WidgetCard.svelte';
	import PianoKeys, { type KeyMark } from '#lib/components/PianoKeys.svelte';
	import Segmented from '#lib/components/Segmented.svelte';
	import HearButton from '#lib/components/HearButton.svelte';
	import ShuffleButton from '#lib/components/ShuffleButton.svelte';
	import { Deck, exampleSource } from '#lib/music/deck.svelte.ts';
	import { arrange, type Example } from '#lib/music/example.ts';
	import { MODES } from '#lib/theory/scales.ts';
	import { player } from '#lib/stores/player.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { parseKey, type Key } from '#lib/theory/progression.ts';
	import { noteLabel } from '#lib/theory/labels.ts';
	import { scaleStack, type Voicing } from '#lib/theory/voicing.ts';
	import { noteName, prettyDegree, transpose, degreeInterval } from '#lib/theory/pitch.ts';

	type Shape = 'sowhat' | 'quartal';
	interface PadExample extends Example {
		mode: string;
		drone: string;
		shape: Shape;
		pattern: number[];
	}
	const prov = { status: 'generated', origin: 'ai', model: 'claude-opus-5-5/v1' } as const;
	const EXAMPLES: PadExample[] = [
		{ id: 'pad-dorian-swing', title: '도리안 모달 스윙', style: 'modal', key: 'D-', tempo: 138, mode: 'dorian', drone: 'i-7', shape: 'sowhat', pattern: [1, 1, 1, 0, 1, 1, 1, 0], provenance: prov },
		{ id: 'pad-sus-straight', title: '믹솔리디안 sus, 스트레이트 8분', style: 'smooth', key: 'G', tempo: 96, mode: 'mixolydian', drone: 'I9sus', shape: 'quartal', pattern: [0, 1, 2, 1, 0, 6, 5, 6], provenance: prov },
		{ id: 'pad-dorian-ballad', title: '도리안 발라드 패드', style: 'pad', key: 'E-', tempo: 60, mode: 'dorian', drone: 'i-7', shape: 'quartal', pattern: [0, 2, 1, 3, 2, 1, 0, 6], provenance: prov }
	];
	const STEPS: Record<Shape, number[]> = { sowhat: [3, 3, 3, 2], quartal: [3, 3, 3] };

	const id = $props.id();
	const deck = new Deck(EXAMPLES);
	let ex = $derived(deck.current as PadExample);
	let shape = $state<Shape>('sowhat');
	let pattern = $state<number[]>([...EXAMPLES[0].pattern]);
	let slot = $state(0);

	let key = $derived(player.keyFor(id, parseKey(ex.key), ex.id));
	let mode = $derived(MODES.find((m) => m.id === ex.mode)!);
	let playing = $derived(player.isPlaying(id));

	function shapeAt(k: Key, deg: number, sh: Shape): Voicing {
		const m = MODES.find((x) => x.id === ex.mode)!;
		return { notes: scaleStack(k.tonic, m.degrees, deg, STEPS[sh], 52) };
	}

	function exampleNow(): Example {
		const bar = `${ex.drone}:2 ${ex.drone}:2`;
		return { ...ex, prog: [bar, bar, bar, bar].join(' | ') };
	}

	function build(k: Key, pat: number[], sh: Shape) {
		return arrange(exampleNow(), { key: k, voicings: pat.map((d) => shapeAt(k, d, sh)) }).seq;
	}

	let current = $derived(shapeAt(key, pattern[playing && player.mark >= 0 ? player.mark : slot], shape));
	let marks = $derived.by(() => {
		const out: Record<number, KeyMark> = {};
		for (const n of current.notes) out[n.midi] = { kind: n.degree === '1' ? 'root' : 'chord', label: noteLabel(settings.labels, n.pitch, n.degree, key.tonic) };
		return out;
	});

	function source() {
		const pat = [...pattern];
		const sh = shape;
		return { ...exampleSource(id, exampleNow()), title: `${sh === 'sowhat' ? 'So What' : '4도 쌓기'} · ${ex.title}`, build: (k: Key) => build(k, pat, sh) };
	}

	function setDegree(d: number) {
		pattern[slot] = d;
		player.tap(ex.style === 'smooth' ? 'epiano' : 'piano', shapeAt(key, d, shape).notes.map((n) => n.midi), 1.4, 0.6);
		slot = (slot + 1) % pattern.length;
		player.update(source());
	}

	function loadExample() {
		shape = (deck.current as PadExample).shape;
		pattern = [...(deck.current as PadExample).pattern];
		slot = 0;
	}
</script>

<WidgetCard
	title="모달 평행 이동 패드"
	kicker="모양 하나, 모드 안에서"
	color="var(--teal)"
	example={ex}
	summary="칸을 고른 뒤 아래 음도를 누르면 그 칸에서 모양이 그 음도로 옮겨 갑니다. 같은 모양이 모드의 음만 써서 움직이니, 간격이 조금씩 바뀌면서도 한 가지 색으로 들립니다."
>
	<Segmented
		label="모양"
		size="sm"
		bind:value={shape}
		onchange={() => player.update(source())}
		options={[
			{ value: 'sowhat', label: 'So What (4도 셋 + 3도)' },
			{ value: 'quartal', label: '4도 쌓기', color: 'var(--sky)' }
		]}
	/>
	<p class="mt-2 text-sm text-ink-soft">{noteName(key.tonic)} {mode.name} · 베이스는 {noteName(key.tonic)}에 머뭅니다</p>

	<div class="mt-2 grid grid-cols-8 gap-1" role="radiogroup" aria-label="칸 (2박씩)">
		{#each pattern as d, i (i)}
			{@const now = playing && player.mark === i}
			<button
				type="button"
				role="radio"
				aria-checked={slot === i}
				class="grid min-h-11 place-items-center rounded-lg border-2 border-ink text-sm font-bold"
				style:background={slot === i ? 'var(--mustard)' : 'var(--card)'}
				style:outline={now ? '3px solid var(--tomato)' : 'none'}
				onclick={() => (slot = i)}
			>
				{prettyDegree(mode.degrees[d])}
			</button>
		{/each}
	</div>
	<p class="mt-1 text-xs text-ink-soft">{slot + 1}번째 칸에 놓을 음도:</p>
	<div class="mt-1 grid grid-cols-7 gap-1">
		{#each mode.degrees as deg, d (d)}
			<button type="button" class="min-h-11 rounded-lg border-2 border-ink bg-paper-2 text-sm font-bold" onclick={() => setDegree(d)}>
				{prettyDegree(deg)}
				<span class="block text-[0.65rem] font-normal">{noteName(transpose(key.tonic, degreeInterval(deg)))}</span>
			</button>
		{/each}
	</div>

	<div class="mt-3">
		<PianoKeys low={50} high={Math.max(76, ...current.notes.map((n) => n.midi + 1))} {marks} onTap={(m) => player.tap('piano', [m])} />
	</div>

	{#snippet controls()}
		<HearButton {playing} loading={player.loading && player.isActive(id)} onclick={() => (playing ? player.stop() : player.play(source()))} />
		<ShuffleButton
			onclick={() => {
				const was = playing;
				deck.next();
				loadExample();
				if (was) player.play(source());
			}}
			count={deck.label}
		/>
	{/snippet}
</WidgetCard>
