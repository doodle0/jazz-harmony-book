<script lang="ts">
	// ★ Dominant Palette (guide §3): a fixed ii – V7 – I loop; pick one of seven
	// dominant scales for the V7 and hear the voicing and a scale run change with it.
	import data from '#lib/data/examples/dominant-palette.json';
	import WidgetCard from '#lib/components/WidgetCard.svelte';
	import PianoKeys, { type KeyMark } from '#lib/components/PianoKeys.svelte';
	import ChordStrip from '#lib/components/ChordStrip.svelte';
	import HearButton from '#lib/components/HearButton.svelte';
	import ShuffleButton from '#lib/components/ShuffleButton.svelte';
	import { Deck, exampleSource } from '#lib/music/deck.svelte.ts';
	import { arrange, type Example } from '#lib/music/example.ts';
	import { DOMINANT_SCALES } from '#lib/theory/scales.ts';
	import { player } from '#lib/stores/player.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { parseKey, type Key } from '#lib/theory/progression.ts';
	import { noteLabel } from '#lib/theory/labels.ts';
	import { degreeInterval, midiAtOrAbove, prettyDegree, transpose } from '#lib/theory/pitch.ts';
	import type { NoteEv } from '#lib/audio/types.ts';

	const id = $props.id();
	const deck = new Deck(data.examples as Example[]);

	// how each scale writes the V chord
	const V_SUFFIX: Record<string, string> = {
		mixolydian: '13',
		'aeolian-dominant': '7(♭13)',
		'phrygian-dominant': '7(♭9, ♭13)',
		'lydian-dominant': '7(9, ♯11, 13)',
		altered: '7alt',
		'whole-tone': '+7(9, ♯11)',
		'half-whole': '7(♭9, 13)'
	};
	// tension, from calm to wild (for the meter)
	const TENSION: Record<string, number> = {
		mixolydian: 1,
		'lydian-dominant': 2,
		'aeolian-dominant': 3,
		'whole-tone': 3.5,
		'half-whole': 4,
		'phrygian-dominant': 4,
		altered: 5
	};
	const NATURAL = ['1', '2', '3', '4', '5', '6', 'b7'];

	let scaleId = $state('altered');
	let ex = $derived(deck.current);
	let usual = $derived(parseKey(ex.key));
	let key = $derived(player.keyFor(id, usual, ex.id));
	let scale = $derived(DOMINANT_SCALES.find((s) => s.id === scaleId)!);

	function withV(e: Example, sid: string): Example {
		return { ...e, prog: e.prog!.replace(/V7/, `V${V_SUFFIX[sid]}`), voicing: 'rootless' };
	}

	/** an 8th-note run up the scale over the V bar */
	function run(k: Key, sid: string): NoteEv[] {
		const s = DOMINANT_SCALES.find((x) => x.id === sid)!;
		const V = transpose(k.tonic, degreeInterval('5'));
		const low = midiAtOrAbove(V, 64);
		const notes = [...s.degrees.map((d) => low + degreeInterval(d).semis), low + 12];
		const line = notes.slice(0, 8);
		const meter = 4;
		return line.map((m, i) => ({ beat: meter + i / 2, dur: 0.5, inst: 'vibes' as const, midi: [m], vel: i % 2 ? 0.55 : 0.7 }));
	}

	let arranged = $derived(arrange(withV(ex, scaleId), { key }));
	let playing = $derived(player.isPlaying(id));
	let V = $derived(transpose(key.tonic, degreeInterval('5')));

	let marks = $derived.by(() => {
		const out: Record<number, KeyMark> = {};
		const low = midiAtOrAbove(V, 60);
		for (const d of scale.degrees) {
			const p = transpose(V, degreeInterval(d));
			const isChordTone = ['1', '3', 'b7'].includes(d);
			const altered = !isChordTone && !NATURAL.includes(d);
			out[low + degreeInterval(d).semis] = {
				kind: d === '1' ? 'root' : isChordTone ? 'chord' : altered ? 'altered' : 'tension',
				label: noteLabel(settings.labels, p, d, key.tonic)
			};
		}
		return out;
	});

	function source() {
		const sid = scaleId;
		return {
			...exampleSource(id, withV(ex, sid)),
			title: `V7 = ${scale.name} · ${ex.title}`,
			build: (k: Key) => arrange(withV(ex, sid), { key: k, extra: run(k, sid) }).seq
		};
	}

	function pick(sid: string) {
		scaleId = sid;
		player.update(source());
	}
</script>

<WidgetCard
	title="도미넌트 팔레트"
	kicker="V7 하나, 일곱 가지 색"
	color="var(--plum)"
	example={ex}
	summary="ii – V7 – I은 그대로 두고 V7의 스케일만 바꿔 보세요. 믹솔리디안에서 얼터드로 갈수록 긴장이 커집니다. 빨간 음은 믹솔리디안에서 바뀐 '얼터드 텐션'이에요."
>
	<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
		{#each DOMINANT_SCALES as s (s.id)}
			{@const on = s.id === scaleId}
			<button
				type="button"
				class="rounded-2xl border-2 border-ink p-2 text-left transition-all {on ? 'shadow-[3px_3px_0_var(--shadow)]' : ''}"
				style:background={on ? 'var(--mustard)' : 'var(--card)'}
				aria-pressed={on}
				onclick={() => pick(s.id)}
			>
				<span class="block text-sm leading-tight font-extrabold {on ? 'text-on-color' : ''}">{s.name}</span>
				<span class="block text-xs {on ? 'text-on-color/80' : 'text-ink-soft'}">V{s.chord}</span>
				<span class="mt-1 flex gap-0.5" aria-label="긴장도 {TENSION[s.id]}">
					{#each [1, 2, 3, 4, 5] as n (n)}
						<span class="h-1.5 flex-1 rounded-full border border-ink/40" style:background={n <= TENSION[s.id] ? 'var(--tomato)' : 'transparent'}></span>
					{/each}
				</span>
			</button>
		{/each}
	</div>

	<p class="mt-3 text-sm"><b>{scale.name}</b> · {scale.mood}</p>
	<div class="mt-1 flex flex-wrap gap-1">
		{#each scale.degrees as d (d)}
			<span class="rounded-md border-2 border-ink px-1.5 text-sm font-bold" style:background={['1', '3', 'b7'].includes(d) ? 'var(--teal)' : NATURAL.includes(d) ? 'var(--sky)' : 'var(--tomato)'}>{prettyDegree(d)}</span>
		{/each}
	</div>

	<div class="mt-3 rounded-2xl border-2 border-ink bg-paper-2 p-2.5">
		<ChordStrip chords={arranged.chords} active={playing ? player.mark : -1} />
	</div>
	<div class="mt-3">
		<PianoKeys low={midiAtOrAbove(V, 60) - 1} high={midiAtOrAbove(V, 60) + 12} {marks} onTap={(m) => player.tap('vibes', [m])} />
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
