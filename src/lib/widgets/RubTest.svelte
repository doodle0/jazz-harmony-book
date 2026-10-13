<script lang="ts">
	// ★ The Rub Test (guide §2, 기피음): hold a chord, tap each scale degree against it,
	// rate how it feels, then compare with the class consensus (F on Δ7, A♭ on -7).
	import data from '#lib/data/examples/rub-test.json';
	import WidgetCard from '#lib/components/WidgetCard.svelte';
	import PianoKeys, { type KeyMark } from '#lib/components/PianoKeys.svelte';
	import Segmented from '#lib/components/Segmented.svelte';
	import HearButton from '#lib/components/HearButton.svelte';
	import ShuffleButton from '#lib/components/ShuffleButton.svelte';
	import { Deck, exampleSource } from '#lib/music/deck.svelte.ts';
	import { arrange, type Example } from '#lib/music/example.ts';
	import { SCALES, avoidNotes, scalePitches } from '#lib/theory/scales.ts';
	import { romanToChord } from '#lib/theory/roman.ts';
	import { player } from '#lib/stores/player.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { parseKey, type Key } from '#lib/theory/progression.ts';
	import { noteLabel } from '#lib/theory/labels.ts';
	import { degreeInterval, midiAtOrAbove, noteName, prettyDegree } from '#lib/theory/pitch.ts';
	import type { NoteEv } from '#lib/audio/types.ts';
	import { Eye, Sparkles } from '@lucide/svelte';

	type ChordId = 'maj7' | 'dom7' | 'min7';
	const CHORDS: Record<ChordId, { roman: string; plain: string; jazz: string; label: string }> = {
		maj7: { roman: 'IΔ7', plain: 'ionian', jazz: 'lydian', label: 'Δ7' },
		dom7: { roman: 'I7', plain: 'mixolydian', jazz: 'lydian-dominant', label: '7' },
		min7: { roman: 'i-7', plain: 'aeolian', jazz: 'dorian', label: '-7' }
	};
	// short original phrases that lean on the avoid note on purpose, then resolve (degree, beats)
	const LEAN: Record<ChordId, [string, number][]> = {
		maj7: [['5', 0.5], ['6', 0.5], ['4', 2], ['3', 1.5], ['2', 0.5], ['3', 3]],
		dom7: [['5', 0.5], ['b7', 0.5], ['4', 2], ['3', 1.5], ['1', 0.5], ['3', 3]],
		min7: [['4', 0.5], ['5', 0.5], ['b6', 2], ['5', 1.5], ['b3', 0.5], ['5', 3]]
	};

	const id = $props.id();
	const deck = new Deck(data.examples as Example[]);

	let chordId = $state<ChordId>('maj7');
	let scaleKind = $state<'plain' | 'jazz'>('plain');
	let ratings = $state<Record<string, number>>({});
	let revealed = $state(false);
	let lastTapped = $state<string | null>(null);

	const RATES = [
		{ label: '달콤', emoji: '🍯', color: 'var(--leaf)' },
		{ label: '짜릿', emoji: '⚡', color: 'var(--mustard)' },
		{ label: '거슬림', emoji: '😖', color: 'var(--tomato)' }
	];

	let ex = $derived(deck.current);
	let key = $derived(player.keyFor(id, parseKey(ex.key)));
	let def = $derived(CHORDS[chordId]);
	let chord = $derived(romanToChord(def.roman, key.tonic));
	let scale = $derived(SCALES[def[scaleKind]]);
	let notes = $derived(scalePitches(key.tonic, scale));
	let avoid = $derived(avoidNotes(chord, scale.degrees));
	let playing = $derived(player.isPlaying(id));
	let base = $derived(midiAtOrAbove(key.tonic, 67));

	function vamp(): Example {
		return { ...ex, prog: `${def.roman} | %`, voicing: 'rootless' };
	}

	function source() {
		return { ...exampleSource(id, vamp()), title: `${noteName(key.tonic)}${def.label} 위에서 · ${ex.title}` };
	}

	function tapDegree(d: string) {
		lastTapped = d;
		const midi = base + degreeInterval(d).semis;
		if (!playing) {
			// no band running: play the chord with the note
			const v = arrange(vamp(), { key }).voicings[0].notes.map((n) => n.midi);
			player.tap('piano', v, 2.4, 0.5);
		}
		player.tap('vibes', [midi], 2.2, 0.8);
	}

	function rate(d: string, r: number) {
		ratings = { ...ratings, [d]: ratings[d] === r ? -1 : r };
	}

	function lean() {
		const phrase = LEAN[chordId];
		let beat = 0;
		const extra: NoteEv[] = phrase.map(([d, dur]) => {
			const ev: NoteEv = { beat, dur: dur * 0.95, inst: 'vibes', midi: [base + degreeInterval(d).semis], vel: 0.75 };
			beat += dur;
			return ev;
		});
		const ex2: Example = { ...vamp(), prog: `${def.roman} | %` };
		player.play(
			{ ...exampleSource(id, ex2), title: '기피음을 일부러 길게', build: (k: Key) => arrange(ex2, { key: k, extra }).seq },
			{ loop: false }
		);
	}

	let marks = $derived.by(() => {
		const out: Record<number, KeyMark> = {};
		for (const n of notes) {
			const midi = base + degreeInterval(n.degree).semis;
			const isAvoid = revealed && avoid.includes(n.degree);
			const chordTone = ['1', '3', 'b3', '5', '7', 'b7'].includes(n.degree);
			out[midi] = {
				kind: isAvoid ? 'avoid' : n.degree === '1' ? 'root' : chordTone ? 'chord' : 'tension',
				label: noteLabel(settings.labels, n.pitch, n.degree, key.tonic)
			};
		}
		return out;
	});

	let verdict = $derived.by(() => {
		const picked = Object.entries(ratings)
			.filter(([, r]) => r === 2)
			.map(([d]) => d);
		const hits = picked.filter((d) => avoid.includes(d));
		return { picked, hits };
	});

	function reset() {
		ratings = {};
		revealed = false;
	}
</script>

<WidgetCard
	title="거슬리는 음 찾기 (기피음)"
	kicker="귀로 실험"
	color="var(--plum)"
	example={ex}
	summary="코드를 켜 두고 스케일 음을 하나씩 눌러 보세요. 코드톤(1·3·5)의 반음 위에 있는 음이 가장 거슬립니다. 리디안과 도리안에는 그런 음이 없어요."
>
	<div class="flex flex-wrap gap-2">
		<Segmented
			label="코드"
			size="sm"
			bind:value={chordId}
			onchange={() => {
				reset();
				if (playing) player.update(source());
			}}
			options={(Object.keys(CHORDS) as ChordId[]).map((c) => ({ value: c, label: noteName(key.tonic) + CHORDS[c].label }))}
		/>
		<Segmented
			label="스케일"
			size="sm"
			bind:value={scaleKind}
			onchange={() => (revealed = false)}
			options={[
				{ value: 'plain', label: SCALES[def.plain].name },
				{ value: 'jazz', label: SCALES[def.jazz].name, color: 'var(--teal)' }
			]}
		/>
	</div>

	<ul class="mt-3 space-y-1.5">
		{#each notes as n (n.degree)}
			{@const isAvoid = revealed && avoid.includes(n.degree)}
			<li class="flex items-center gap-2 rounded-xl border-2 p-1 pr-1.5 {isAvoid ? 'border-tomato bg-tomato/10' : 'border-transparent'}">
				<button
					type="button"
					class="btn !min-h-11 !min-w-[4.6rem] !px-2"
					style:background={lastTapped === n.degree ? 'var(--mustard)' : 'var(--card)'}
					onclick={() => tapDegree(n.degree)}
					aria-label="{prettyDegree(n.degree)} ({noteName(n.pitch)}) 들어 보기"
				>
					<span class="font-display text-lg">{prettyDegree(n.degree)}</span>
					<span class="text-xs text-ink-soft">{settings.labels === 'solfege' ? noteLabel('solfege', n.pitch, n.degree, key.tonic) : noteName(n.pitch)}</span>
				</button>
				<div class="flex flex-1 justify-end gap-1" role="radiogroup" aria-label="{prettyDegree(n.degree)} 느낌">
					{#each RATES as r, ri (r.label)}
						{@const on = ratings[n.degree] === ri}
						<button
							type="button"
							role="radio"
							aria-checked={on}
							class="min-h-10 rounded-full border-2 px-2 text-xs font-bold transition-all {on ? 'border-ink text-on-color' : 'border-ink/20 text-ink-soft'}"
							style:background={on ? r.color : 'transparent'}
							onclick={() => rate(n.degree, ri)}
						>
							<span aria-hidden="true">{r.emoji}</span>{r.label}
						</button>
					{/each}
				</div>
			</li>
		{/each}
	</ul>

	<div class="mt-3">
		<PianoKeys low={base - 1} high={base + 12} {marks} onTap={(m) => player.tap('vibes', [m], 2)} />
	</div>

	{#if revealed}
		<div class="mt-3 rounded-2xl border-2 border-ink p-3 text-sm" style:background={avoid.length ? 'var(--paper-2)' : 'var(--leaf)'}>
			{#if avoid.length === 0}
				<b>{scale.name}에는 기피음이 없어요.</b> 2·4·6도가 모두 1·3·5도의 온음 위에 있거든요.
			{:else}
				<b>기피음: {avoid.map((d) => `${prettyDegree(d)} (${noteName(notes.find((n) => n.degree === d)!.pitch)})`).join(', ')}</b>
				<br />
				{#if verdict.picked.length === 0}
					아직 '거슬림'으로 고른 음이 없네요. 그래도 괜찮아요. 자기 귀를 믿으세요.
				{:else if verdict.hits.length}
					당신의 귀도 같은 음을 골랐어요! 수업에서도 거의 모두가 이 음을 꼽았습니다.
				{:else}
					수업에서는 대부분 다른 음을 꼽았지만, "기피음"은 법칙이 아니라 조심해서 다룰 음일 뿐이에요.
				{/if}
			{/if}
		</div>
	{/if}

	{#snippet controls()}
		<HearButton {playing} label="코드 켜기" loading={player.loading && player.isActive(id)} onclick={() => (playing ? player.stop() : player.play(source()))} />
		<button type="button" class="btn" style:background="var(--mustard)" style:color="var(--on-color)" onclick={() => (revealed = !revealed)}>
			<Eye size={18} /> 정답 {revealed ? '숨기기' : '보기'}
		</button>
		{#if avoid.length}
			<button type="button" class="btn" style:background="var(--teal)" style:color="var(--on-color)" onclick={lean}>
				<Sparkles size={18} /> 기피음을 일부러
			</button>
		{/if}
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
