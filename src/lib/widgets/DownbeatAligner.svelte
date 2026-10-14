<script lang="ts">
	// ★ Downbeat Aligner (guide §4): an 8th-note scale run down from the root over two bars.
	// With a seven-note scale the chord tones drift onto the off-beats; adding the bebop
	// passing tone makes eight notes per octave, and they snap back onto the beat.
	import WidgetCard from '#lib/components/WidgetCard.svelte';
	import Segmented from '#lib/components/Segmented.svelte';
	import HearButton from '#lib/components/HearButton.svelte';
	import ShuffleButton from '#lib/components/ShuffleButton.svelte';
	import { Deck, exampleSource } from '#lib/music/deck.svelte.ts';
	import { arrange, type Example } from '#lib/music/example.ts';
	import { player } from '#lib/stores/player.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { parseKey, type Key } from '#lib/theory/progression.ts';
	import { romanToChord } from '#lib/theory/roman.ts';
	import { noteLabel } from '#lib/theory/labels.ts';
	import { degreeInterval, midiAtOrAbove, transpose, type Pitch } from '#lib/theory/pitch.ts';
	import type { NoteEv } from '#lib/audio/types.ts';

	type Kind = 'dominant' | 'major' | 'minor';
	// descending from the root; `passing` is the added bebop note
	const SCALES: Record<Kind, { label: string; roman: string; plain: string[]; bebop: string[]; passing: string; tones: string[]; chord: string }> = {
		dominant: { label: '도미넌트 (V7)', roman: 'V7', plain: ['1', 'b7', '6', '5', '4', '3', '2'], bebop: ['1', '7', 'b7', '6', '5', '4', '3', '2'], passing: '7', tones: ['1', '3', '5', 'b7'], chord: 'V7' },
		major: { label: '메이저 (I6)', roman: 'I6', plain: ['1', '7', '6', '5', '4', '3', '2'], bebop: ['1', '7', '6', '#5', '5', '4', '3', '2'], passing: '#5', tones: ['1', '3', '5', '6'], chord: 'I6' },
		minor: { label: '마이너 (i-6)', roman: 'i-6', plain: ['1', '7', '6', '5', '4', 'b3', '2'], bebop: ['1', '7', '6', '#5', '5', '4', 'b3', '2'], passing: '#5', tones: ['1', 'b3', '5', '6'], chord: 'i-6' }
	};

	const EXAMPLES: Example[] = [
		{ id: 'downbeat-swing', title: '미디엄 스윙', style: 'swing', key: 'F', tempo: 150, provenance: { status: 'generated', origin: 'ai' } },
		{ id: 'downbeat-bebop', title: '업템포 비밥', style: 'bebop', key: 'B♭', tempo: 196, provenance: { status: 'generated', origin: 'ai' } },
		{ id: 'downbeat-bossa', title: '보사노바 (스트레이트 8분)', style: 'bossa', key: 'C', tempo: 128, provenance: { status: 'generated', origin: 'ai' } }
	];

	const id = $props.id();
	const deck = new Deck(EXAMPLES);
	let kind = $state<Kind>('dominant');
	let bebop = $state(false);

	let base = $derived(deck.current);
	let ex = $derived<Example>({ ...base, prog: `${SCALES[kind].roman} | %`, voicing: 'rootless' });
	let key = $derived(player.keyFor(id, parseKey(base.key), base.id));
	let playing = $derived(player.isPlaying(id));

	interface Cell {
		midi: number;
		pitch: Pitch;
		degree: string;
		tone: boolean;
		passing: boolean;
	}

	/** 16 8th notes down from the chord root, two octaves at most */
	function line(k: Key, which: Kind, withPassing: boolean): Cell[] {
		const s = SCALES[which];
		const root = romanToChord(s.roman, k.tonic).root;
		const top = midiAtOrAbove(root, 74);
		const degrees = withPassing ? s.bebop : s.plain;
		const out: Cell[] = [];
		let octave = 0;
		for (let i = 0; i < 16; i++) {
			const j = i % degrees.length;
			if (i > 0 && j === 0) octave--;
			const d = degrees[j];
			const semis = d === '1' ? 0 : degreeInterval(d).semis - 12;
			out.push({ midi: top + semis + 12 * octave, pitch: transpose(root, degreeInterval(d)), degree: d, tone: s.tones.includes(d), passing: withPassing && d === s.passing });
		}
		return out;
	}

	let cells = $derived(line(key, kind, bebop));
	let onBeat = $derived(cells.filter((c, i) => i % 2 === 0 && c.tone).length);

	function events(cs: Cell[]): NoteEv[] {
		return cs.map((c, i) => ({ beat: i / 2, dur: 0.5, inst: 'vibes', midi: [c.midi], vel: i % 2 ? 0.55 : 0.72 }));
	}

	function source() {
		const which = kind;
		const withPassing = bebop;
		return {
			...exampleSource(id, ex),
			content: base.id,
			title: `${SCALES[which].label} · ${withPassing ? '비밥' : '7음'} 스케일`,
			build: (k: Key) => {
				const cs = line(k, which, withPassing);
				const seq = arrange({ ...base, prog: `${SCALES[which].roman} | %`, voicing: 'rootless' }, { key: k, extra: events(cs) }).seq;
				// the cursor follows the line, one mark per note
				seq.marks = cs.map((_, i) => ({ beat: i / 2, index: i }));
				return seq;
			}
		};
	}

	const refresh = () => player.update(source());
</script>

<WidgetCard
	title="정박 맞추기"
	kicker="비밥 경과음의 역할"
	color="var(--sky)"
	example={base}
	summary="근음에서 8분음표로 내려갑니다. 7음 스케일이면 코드톤(초록)이 점점 뒷박으로 밀리고, 경과음 하나를 더하면 정박(굵은 칸)으로 돌아옵니다."
>
	<div class="flex flex-wrap gap-2">
		<Segmented
			label="코드"
			size="sm"
			bind:value={kind}
			onchange={refresh}
			options={(Object.keys(SCALES) as Kind[]).map((k) => ({ value: k, label: SCALES[k].label }))}
		/>
		<Segmented
			label="경과음"
			size="sm"
			value={bebop ? 'on' : 'off'}
			onchange={(v) => {
				bebop = v === 'on';
				refresh();
			}}
			options={[
				{ value: 'off', label: '7음 스케일' },
				{ value: 'on', label: '+ 경과음 (비밥)', color: 'var(--mustard)' }
			]}
		/>
	</div>

	{#each [0, 1] as bar (bar)}
		<div class="mt-3 grid grid-cols-8 gap-1" role="list" aria-label="{bar + 1}마디">
			{#each cells.slice(bar * 8, bar * 8 + 8) as c, j (j)}
				{@const i = bar * 8 + j}
				{@const now = playing && player.mark === i}
				<div
					role="listitem"
					class="grid min-h-12 place-items-center rounded-lg border-ink text-center text-xs font-bold leading-tight transition-transform {j % 2 === 0 ? 'border-[3px]' : 'border-2 border-dashed'}"
					class:scale-110={now}
					style:background={c.passing ? 'var(--mustard)' : c.tone ? 'var(--leaf)' : 'var(--card)'}
					style:color={c.tone || c.passing ? 'var(--on-color)' : 'var(--ink)'}
					style:outline={now ? '3px solid var(--tomato)' : 'none'}
				>
					<span>{noteLabel(settings.labels, c.pitch, c.degree, key.tonic)}</span>
					<span class="text-[0.65rem] font-normal opacity-75">{j % 2 === 0 ? `${j / 2 + 1}박` : '&'}</span>
				</div>
			{/each}
		</div>
	{/each}
	<p class="mt-3 text-sm" aria-live="polite">
		정박 8개 중 코드톤: <b class="text-lg">{onBeat}/8</b>
		{#if bebop}· 경과음 덕분에 한 옥타브가 딱 8분음표 8개가 됩니다.{:else}· 7음이라 한 바퀴 돌 때마다 한 칸씩 밀립니다.{/if}
	</p>

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
