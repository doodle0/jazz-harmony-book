<script lang="ts">
	// ★ Mode Brightness Slider (guide §2): seven modes on one root, brightest to darkest.
	// Each step changes exactly one note; its mark glides to the new key and the parent-scale window
	// on the circle of fifths turns one step.
	import data from '#lib/data/examples/mode-vamps.json';
	import WidgetCard from '#lib/components/WidgetCard.svelte';
	import PianoKeys, { type KeyMark } from '#lib/components/PianoKeys.svelte';
	import HearButton from '#lib/components/HearButton.svelte';
	import ShuffleButton from '#lib/components/ShuffleButton.svelte';
	import { Deck, exampleSource } from '#lib/music/deck.svelte.ts';
	import { arrange, type Example } from '#lib/music/example.ts';
	import { MODES, scalePitches } from '#lib/theory/scales.ts';
	import { player } from '#lib/stores/player.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { parseKey, type Key } from '#lib/theory/progression.ts';
	import { noteLabel } from '#lib/theory/labels.ts';
	import { degreeInterval, midiAtOrAbove, noteName, prettyDegree, transpose } from '#lib/theory/pitch.ts';
	import type { NoteEv } from '#lib/audio/types.ts';

	const id = $props.id();
	const deck = new Deck(data.examples as Example[]);

	// the chord each mode vamps on
	const VAMP: Record<string, string> = {
		lydian: 'IΔ7(♯11)',
		ionian: 'IΔ7',
		mixolydian: 'I13',
		dorian: 'i-7(13)',
		aeolian: 'i-7(♭13)',
		phrygian: 'i-7(♭9)',
		locrian: 'iø7'
	};

	let pos = $state(1); // ionian
	let prevPos = $state(1);
	let mode = $derived(MODES[pos]);
	let ex = $derived(deck.current);
	let key = $derived(player.keyFor(id, parseKey(ex.key), ex.id));

	function vampExample(m = mode): Example {
		return { ...ex, prog: `${VAMP[m.id]} | %`, voicing: 'rootless' };
	}

	/** 8th-note run up and down the mode on vibes, two bars */
	function run(k: Key, m = mode): NoteEv[] {
		const low = midiAtOrAbove(k.tonic, 66);
		const pitches = m.degrees.map((d) => low + degreeInterval(d).semis);
		const line = [...pitches, low + 12, ...[...pitches].reverse()];
		return line.map((midi, i) => ({ beat: i / 2, dur: i === line.length - 1 ? 1.4 : 0.5, inst: 'vibes', midi: [midi], vel: i % 2 ? 0.55 : 0.68 }));
	}

	let arranged = $derived(arrange(vampExample(), { key }));
	let playing = $derived(player.isPlaying(id));

	let scale = $derived(scalePitches(key.tonic, mode));
	// every mode lists its seven steps in order, so step i of one mode moved to step i of
	// the next; usually one note, more when the reader jumps several modes at once
	let moves = $derived.by(() => {
		if (prevPos === pos) return [];
		const before = MODES[prevPos].degrees;
		return mode.degrees
			.map((d, i) => ({ from: before[i], to: d }))
			.filter((m) => m.from !== m.to)
			.map((m) => ({ ...m, up: degreeInterval(m.to).semis > degreeInterval(m.from).semis }));
	});
	let movedTo = $derived(new Map(moves.map((m) => [m.to, m.up])));

	let marks = $derived.by(() => {
		const out: Record<number, KeyMark> = {};
		const low = midiAtOrAbove(key.tonic, 60);
		for (const s of scale) {
			const midi = low + degreeInterval(s.degree).semis;
			const kind: KeyMark['kind'] = s.degree === '1' ? 'root' : s.degree === mode.character ? 'character' : 'chord';
			out[midi] = { kind, label: noteLabel(settings.labels, s.pitch, s.degree, key.tonic) };
		}
		return out;
	});
	let glides = $derived.by(() => {
		const low = midiAtOrAbove(key.tonic, 60);
		return moves.map((m) => ({ from: low + degreeInterval(m.from).semis, to: low + degreeInterval(m.to).semis }));
	});

	// circle of fifths: parent-scale window turns one step per mode
	const FIFTHS = Array.from({ length: 12 }, (_, i) => i);
	let shift = $derived(1 - pos); // lydian +1 … locrian -5
	let windowSet = $derived(new Set(Array.from({ length: 7 }, (_, i) => (((shift - 1 + i) % 12) + 12) % 12)));
	// clockwise = sharp side, counter-clockwise = flat side. Inside the window, spell each
	// note as the mode does (Locrian on C has G♭, Lydian has F♯).
	let fifthName = (i: number) => {
		const lo = shift - 1;
		const inWindow = (((i - lo) % 12) + 12) % 12 < 7;
		const j = inWindow ? lo + ((((i - lo) % 12) + 12) % 12) : i <= 6 ? i : i - 12;
		return noteName(transpose(key.tonic, { steps: (((j * 4) % 7) + 7) % 7, semis: (((j * 7) % 12) + 12) % 12 }));
	};

	function source() {
		const m = mode;
		return { ...exampleSource(id, vampExample(m)), title: `${m.name} · ${ex.title}`, build: (k: Key) => arrange(vampExample(m), { key: k, extra: run(k, m) }).seq };
	}

	function setPos(p: number) {
		prevPos = pos;
		pos = Math.max(0, Math.min(6, p));
		if (playing) player.update(source());
	}

	function shuffle() {
		const was = playing;
		deck.next();
		if (was) player.play(source());
	}
</script>

<WidgetCard
	title="모드 밝기 슬라이더"
	kicker="밝음 → 어두움"
	color="var(--mustard)"
	example={ex}
	summary="이웃한 모드끼리는 음 하나만 다릅니다. 슬라이더를 한 칸씩 움직이며 어떤 음이 바뀌는지 들어 보세요."
>
	<div class="flex items-end justify-between gap-3">
		<div>
			<div class="font-display text-3xl leading-none">{noteName(key.tonic)} {mode.name}</div>
			<div class="mt-1 text-sm text-ink-soft">{mode.mood}</div>
			<div class="mt-2 flex flex-wrap gap-1 font-bold">
				{#each mode.degrees as d (d)}
					{#key `${pos}:${d}`}
						<span
							class="grid min-w-8 place-items-center rounded-lg border-2 border-ink px-1 text-sm"
							style:background={d === mode.character ? 'var(--mustard)' : 'var(--card)'}
							style:animation={movedTo.has(d) ? `${movedTo.get(d) ? 'nudge-up' : 'nudge-down'} 520ms ease-out` : ''}
							>{#if movedTo.has(d)}<span class="text-[0.65rem] leading-none" aria-hidden="true">{movedTo.get(d) ? '▲' : '▼'}</span>{/if}{prettyDegree(d)}</span
						>
					{/key}
				{/each}
			</div>
		</div>
		<!-- circle of fifths -->
		<svg viewBox="-60 -60 120 120" class="w-28 shrink-0" role="img" aria-label="5도권: 이 모드의 부모 스케일">
			<circle r="56" fill="var(--paper-2)" stroke="var(--ink)" stroke-width="2.5" />
			{#each FIFTHS as i (i)}
				{@const a = (i * 30 - 90) * (Math.PI / 180)}
				{@const on = windowSet.has(i)}
				<circle cx={Math.cos(a) * 42} cy={Math.sin(a) * 42} r="10" fill={i === 0 ? 'var(--ink)' : on ? 'var(--teal)' : 'var(--card)'} stroke="var(--ink)" stroke-width="1.5" style="transition: fill 300ms" />
				<text x={Math.cos(a) * 42} y={Math.sin(a) * 42} text-anchor="middle" dominant-baseline="central" font-size="7.5" font-weight="800" fill={i === 0 ? 'var(--paper)' : on ? 'var(--on-color)' : 'var(--ink-soft)'}>{fifthName(i)}</text>
			{/each}
			<text text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="800" fill="var(--ink)">{shift > 0 ? '+1' : shift}</text>
		</svg>
	</div>

	<div class="mt-4">
		<input
			type="range"
			min="0"
			max="6"
			step="1"
			value={pos}
			oninput={(e) => setPos(Number(e.currentTarget.value))}
			class="mode-slider w-full"
			aria-label="모드"
			aria-valuetext={mode.name}
		/>
		<div class="mt-1 flex justify-between text-[0.7rem] font-bold text-ink-soft">
			<span>☀️ 리디안</span><span>로크리안 🌑</span>
		</div>
		<div class="mt-2 flex flex-wrap gap-1.5">
			{#each MODES as m, i (m.id)}
				<button
					type="button"
					class="min-h-10 flex-auto rounded-full border-2 border-ink px-2.5 text-sm font-bold"
					style:background={i === pos ? 'var(--mustard)' : 'var(--card)'}
					onclick={() => setPos(i)}>{m.name}</button
				>
			{/each}
		</div>
	</div>

	<div class="mt-4">
		<PianoKeys low={midiAtOrAbove(key.tonic, 60) - 2} high={midiAtOrAbove(key.tonic, 60) + 13} {marks} {glides} onTap={(m) => player.tap('vibes', [m])} />
	</div>
	<p class="mt-2 text-sm">
		뱀프 코드: <b>{arranged.chords[0].symbol}</b>
		{#if mode.character}· 특징음 <b>{prettyDegree(mode.character)}</b>{/if}
	</p>

	{#snippet controls()}
		<HearButton {playing} loading={player.loading && player.isActive(id)} onclick={() => (playing ? player.stop() : player.play(source()))} />
		<ShuffleButton onclick={shuffle} count={deck.label} />
	{/snippet}
</WidgetCard>

<style>
	@keyframes -global-nudge-up {
		0% {
			transform: translateY(8px);
		}
		100% {
			transform: translateY(0);
		}
	}
	@keyframes -global-nudge-down {
		0% {
			transform: translateY(-8px);
		}
		100% {
			transform: translateY(0);
		}
	}
	.mode-slider {
		appearance: none;
		height: 44px;
		background: transparent;
	}
	.mode-slider::-webkit-slider-runnable-track {
		height: 14px;
		border-radius: 999px;
		border: 2px solid var(--ink);
		background: linear-gradient(90deg, #ffe58a, var(--mustard), var(--tomato), var(--plum), #3b3050);
	}
	.mode-slider::-webkit-slider-thumb {
		appearance: none;
		width: 34px;
		height: 34px;
		margin-top: -12px;
		border-radius: 999px;
		border: 3px solid var(--ink);
		background: var(--card);
		box-shadow: 2px 2px 0 var(--shadow);
	}
</style>
