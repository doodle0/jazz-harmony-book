<script lang="ts">
	// ✦ Home-Away-Home Journey (ch.1, reused in ch.6): the lecture's "코드 진행은 여행이다"
	// as a path. Each chord is a step at a height that shows how far from home it feels;
	// the walker follows the music, and the slider lets the reader step through by hand
	// (each step plays its chord). Ch.6 adds detours: an inn, the neighbour's door,
	// dimmed lights and the back door.
	import { untrack } from 'svelte';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import WidgetCard from '#lib/components/WidgetCard.svelte';
	import HearButton from '#lib/components/HearButton.svelte';
	import ShuffleButton from '#lib/components/ShuffleButton.svelte';
	import { Deck, exampleSource } from '#lib/music/deck.svelte.ts';
	import { arrange, type Example } from '#lib/music/example.ts';
	import { player } from '#lib/stores/player.svelte.ts';
	import { settings } from '#lib/stores/settings.svelte.ts';
	import { parseKey } from '#lib/theory/progression.ts';
	import { bassMidi } from '#lib/theory/voicing.ts';

	type Place = 'home' | 'road' | 'door' | 'away' | 'inn' | 'neighbor' | 'dim' | 'back';
	interface JourneyExample extends Example {
		steps: { place: Place; say: string }[];
	}
	interface JourneySet {
		concept: string;
		title: string;
		summary: string;
		examples: JourneyExample[];
	}

	const sets = import.meta.glob<JourneySet>('../data/examples/*.json', { eager: true, import: 'default' });
	let { set: setId }: { set: 'journeys' | 'detours' } = $props();
	const wanted = untrack(() => setId);
	const data = Object.values(sets).find((s) => s.concept === wanted);
	if (!data) throw new Error(`No journey set "${wanted}"`);

	// height above home, and the sign each place gets
	const HEIGHT: Record<Place, number> = { home: 0, dim: 0.25, neighbor: 0.7, back: 1.2, door: 1.3, road: 1.9, away: 2.6, inn: 2.6 };
	const ICON: Partial<Record<Place, string>> = { home: '🏠', inn: '🏡', neighbor: '🚪', dim: '🌙', back: '🔑' };

	const id = $props.id();
	const deck = new Deck(data.examples);
	let ex = $derived(deck.current as JourneyExample);
	let key = $derived(player.keyFor(id, parseKey(ex.key), ex.id));
	let arranged = $derived(arrange(ex, { key, voicing: settings.voicing }));
	let playing = $derived(player.isPlaying(id));
	let picked = $state(0);
	let step = $derived(playing && player.mark >= 0 ? player.mark : Math.min(picked, ex.steps.length - 1));

	const W = 320;
	const H = 172;
	let points = $derived(
		ex.steps.map((s, i) => ({
			x: 24 + (i * (W - 48)) / Math.max(1, ex.steps.length - 1),
			y: H - 34 - HEIGHT[s.place] * 32,
			...s
		}))
	);
	let path = $derived(
		points
			.map((p, i) => {
				if (i === 0) return `M ${p.x} ${p.y}`;
				const q = points[i - 1];
				const mx = (q.x + p.x) / 2;
				return `C ${mx} ${q.y}, ${mx} ${p.y}, ${p.x} ${p.y}`;
			})
			.join(' ')
	);

	const walker = new Tween({ x: 24, y: H - 34 }, { duration: 380, easing: cubicOut });
	$effect(() => {
		const p = points[step];
		if (p) walker.target = { x: p.x, y: p.y };
	});

	function hearStep(i: number) {
		picked = i;
		const v = arranged.voicings[i];
		if (!v) return;
		player.tap('piano', v.notes.map((n) => n.midi), 1.6, 0.7);
		player.tap('bass', [bassMidi(arranged.chords[i].chord, 36)], 1.6, 0.7);
	}

	function source() {
		return exampleSource(id, ex, { voicing: settings.voicing });
	}
</script>

<WidgetCard title={data.title} kicker="코드 진행은 여행이다" color="var(--leaf)" example={ex} summary={data.summary}>
	<svg viewBox="0 0 {W} {H}" class="w-full rounded-2xl border-2 border-ink bg-paper-2" role="img" aria-label="{ex.title}: 집에서 출발해 돌아오는 길">
		<path d={path} fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-dasharray="6 5" stroke-linecap="round" opacity="0.45" />
		{#each points as p, i (i)}
			{@const icon = ICON[p.place]}
			<g role="button" tabindex="0" aria-label="{arranged.chords[i]?.symbol} 듣기" onclick={() => hearStep(i)} onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && hearStep(i)} style="cursor: pointer">
				<circle cx={p.x} cy={p.y} r={i === step ? 9 : 7} fill={i === step ? 'var(--mustard)' : 'var(--card)'} stroke="var(--ink)" stroke-width="2" />
				{#if icon}
					<text x={p.x} y={p.y - 14} text-anchor="middle" font-size="18">{icon}</text>
				{/if}
				<text x={p.x} y={H - 6} text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--ink)">{arranged.chords[i]?.symbol}</text>
			</g>
		{/each}
		<text x={walker.current.x} y={walker.current.y + 5} text-anchor="middle" font-size="16" aria-hidden="true">🚶</text>
	</svg>

	<label class="mt-3 block">
		<span class="sr-only">걸음 옮기기</span>
		<input
			type="range"
			min="0"
			max={ex.steps.length - 1}
			step="1"
			value={step}
			oninput={(e) => hearStep(Number(e.currentTarget.value))}
			class="w-full accent-[var(--leaf)]"
			style="height: 44px"
		/>
	</label>
	<p class="mt-1 text-sm" aria-live="polite">
		<b class="font-display text-base">{arranged.chords[step]?.symbol}</b>
		<span class="text-ink-soft">({arranged.chords[step]?.romanLabel})</span>
		· {ex.steps[step]?.say}
	</p>

	{#snippet controls()}
		<HearButton {playing} loading={player.loading && player.isActive(id)} onclick={() => (playing ? player.stop() : player.play(source(), { loop: false }))} />
		<ShuffleButton
			onclick={() => {
				const was = playing;
				deck.next();
				picked = 0;
				if (was) player.play(source(), { loop: false });
			}}
			count={deck.label}
		/>
	{/snippet}
</WidgetCard>
