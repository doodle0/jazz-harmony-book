<script lang="ts" module>
	export type MarkKind = 'chord' | 'root' | 'tension' | 'avoid' | 'character' | 'scale' | 'tritone' | 'melody' | 'resolve' | 'altered';
	export interface KeyMark {
		kind: MarkKind;
		label?: string;
	}
	export const MARK_COLOR: Record<MarkKind, string> = {
		root: 'var(--ink)',
		chord: 'var(--teal)',
		tension: 'var(--sky)',
		avoid: 'var(--tomato)',
		character: 'var(--mustard)',
		scale: 'var(--paper-2)',
		tritone: 'var(--plum)',
		melody: 'var(--mustard)',
		resolve: 'var(--leaf)',
		altered: 'var(--tomato)'
	};
	export const MARK_NAME: Record<MarkKind, string> = {
		root: '근음',
		chord: '코드톤',
		tension: '텐션',
		avoid: '기피음',
		character: '특징음',
		scale: '스케일',
		tritone: '트라이톤',
		melody: '멜로디',
		resolve: '해결음',
		altered: '얼터드 텐션'
	};
</script>

<script lang="ts">
	// SVG keyboard. Marks show what each key is (color + a text label, never color alone).
	// Tapping a key plays it. `glides` animate a mark sliding from one key to another.
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	let {
		low = 48,
		high = 72,
		marks = {},
		flash = [],
		glides = [],
		onTap,
		legend = true,
		names = {}
	}: {
		low?: number;
		high?: number;
		marks?: Record<number, KeyMark>;
		/** keys that briefly light up (e.g. the note that changed) */
		flash?: number[];
		/** marks that just moved: each slides from `from` to the mark on `to` */
		glides?: { from: number; to: number }[];
		onTap?: (midi: number) => void;
		legend?: boolean;
		/** legend names to use instead of the defaults, e.g. where a chapter hasn't taught a term yet */
		names?: Partial<Record<MarkKind, string>>;
	} = $props();

	const BLACK = new Set([1, 3, 6, 8, 10]);
	const isBlack = (m: number) => BLACK.has(((m % 12) + 12) % 12);

	// start and end on white keys
	let lo = $derived(isBlack(low) ? low - 1 : low);
	let hi = $derived(isBlack(high) ? high + 1 : high);

	let layout = $derived.by(() => {
		const whites: { midi: number; x: number }[] = [];
		const blacks: { midi: number; x: number }[] = [];
		let x = 0;
		for (let m = lo; m <= hi; m++) {
			if (isBlack(m)) blacks.push({ midi: m, x: x - 0.31 });
			else {
				whites.push({ midi: m, x });
				x += 1;
			}
		}
		return { whites, blacks, width: x };
	});

	const WH = 4.4;
	const BH = 2.75;
	const BW = 0.62;

	let pressed = $state<number | null>(null);

	/** centre and radius of the mark dot on a key */
	function dot(m: number) {
		const w = layout.whites.find((k) => k.midi === m);
		if (w) return { x: w.x + 0.5, y: WH - 0.55, r: 0.36 };
		const b = layout.blacks.find((k) => k.midi === m);
		if (b) return { x: b.x + BW / 2, y: BH - 0.42, r: 0.27 };
		return null;
	}

	// 0 → 1 each time a new set of glides arrives
	const progress = new Tween(1, { duration: 520, easing: cubicOut });
	$effect(() => {
		if (!glides.length) return;
		progress.set(0, { duration: 0 });
		progress.set(1);
	});
	let gliding = $derived(progress.current < 1 ? glides : []);
	let landing = $derived(new Set(gliding.map((g) => g.to)));
	const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

	function down(m: number) {
		pressed = m;
		onTap?.(m);
	}

	let usedKinds = $derived([...new Set(Object.values(marks).map((k) => k.kind))].filter((k) => k !== 'scale'));
</script>

<div class="select-none">
	<svg
		viewBox="-0.1 -0.1 {layout.width + 0.2} {WH + 0.2}"
		class="block w-full touch-manipulation"
		role="group"
		aria-label="건반"
		onpointerup={() => (pressed = null)}
		onpointerleave={() => (pressed = null)}
	>
		{#each layout.whites as k (k.midi)}
			{@const mark = marks[k.midi]}
			<g
				role="button"
				tabindex="-1"
				aria-label={mark?.label ?? String(k.midi)}
				onpointerdown={() => down(k.midi)}
				class="cursor-pointer"
			>
				<rect
					x={k.x + 0.03}
					y="0"
					width="0.94"
					height={WH}
					rx="0.12"
					fill={mark && mark.kind !== 'scale' ? `color-mix(in srgb, ${MARK_COLOR[mark.kind]} 22%, var(--key-white))` : 'var(--key-white)'}
					stroke="var(--ink)"
					stroke-width="0.07"
					class:flash={flash.includes(k.midi)}
					class:pressed={pressed === k.midi}
				/>
				{#if mark && !landing.has(k.midi)}
					<circle cx={k.x + 0.5} cy={WH - 0.55} r="0.36" fill={MARK_COLOR[mark.kind]} stroke="var(--ink)" stroke-width="0.06" />
					{#if mark.label}
						<text
							x={k.x + 0.5}
							y={WH - 0.55}
							text-anchor="middle"
							dominant-baseline="central"
							font-size={mark.label.length > 2 ? 0.27 : 0.34}
							font-weight="800"
							fill={mark.kind === 'root' ? 'var(--paper)' : 'var(--on-color)'}
							pointer-events="none">{mark.label}</text
						>
					{/if}
				{/if}
			</g>
		{/each}
		{#each layout.blacks as k (k.midi)}
			{@const mark = marks[k.midi]}
			<g role="button" tabindex="-1" aria-label={mark?.label ?? String(k.midi)} onpointerdown={() => down(k.midi)} class="cursor-pointer">
				<rect
					x={k.x}
					y="0"
					width={BW}
					height={BH}
					rx="0.08"
					fill={mark && mark.kind !== 'scale' ? `color-mix(in srgb, ${MARK_COLOR[mark.kind]} 45%, var(--key-black))` : 'var(--key-black)'}
					stroke="var(--ink)"
					stroke-width="0.06"
					class:flash={flash.includes(k.midi)}
					class:pressed={pressed === k.midi}
				/>
				{#if mark && !landing.has(k.midi)}
					<circle cx={k.x + BW / 2} cy={BH - 0.42} r="0.27" fill={MARK_COLOR[mark.kind]} stroke="var(--key-white)" stroke-width="0.05" />
					{#if mark.label}
						<text
							x={k.x + BW / 2}
							y={BH - 0.42}
							text-anchor="middle"
							dominant-baseline="central"
							font-size={mark.label.length > 2 ? 0.2 : 0.25}
							font-weight="800"
							fill={mark.kind === 'root' ? 'var(--paper)' : 'var(--on-color)'}
							pointer-events="none">{mark.label}</text
						>
					{/if}
				{/if}
			</g>
		{/each}
		{#each gliding as g (g.from + ':' + g.to)}
			{@const a = dot(g.from)}
			{@const b = dot(g.to)}
			{@const mark = marks[g.to]}
			{#if a && b && mark}
				{@const t = progress.current}
				<g pointer-events="none">
					<line x1={a.x} y1={a.y} x2={lerp(a.x, b.x, t)} y2={lerp(a.y, b.y, t)} stroke={MARK_COLOR[mark.kind]} stroke-width="0.12" stroke-linecap="round" opacity={0.6 * (1 - t)} />
					<circle cx={lerp(a.x, b.x, t)} cy={lerp(a.y, b.y, t)} r={lerp(a.r, b.r, t)} fill={MARK_COLOR[mark.kind]} stroke="var(--ink)" stroke-width="0.06" />
					{#if mark.label}
						<text x={lerp(a.x, b.x, t)} y={lerp(a.y, b.y, t)} text-anchor="middle" dominant-baseline="central" font-size="0.27" font-weight="800" fill="var(--on-color)">{mark.label}</text>
					{/if}
				</g>
			{/if}
		{/each}
	</svg>
	{#if legend && usedKinds.length > 1}
		<div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-soft">
			{#each usedKinds as k (k)}
				<span class="inline-flex items-center gap-1">
					<span class="inline-block size-3 rounded-full border-[1.5px] border-ink" style:background={MARK_COLOR[k]}></span>
					{names[k] ?? MARK_NAME[k]}
				</span>
			{/each}
		</div>
	{/if}
</div>

<style>
	/* the keys are focusable SVG groups; a browser focus ring gets scaled up with the
	   viewBox into a big black blob, and mobile adds its own tap highlight */
	svg :global(g[role='button']) {
		outline: none;
		-webkit-tap-highlight-color: transparent;
	}
	.pressed {
		filter: brightness(0.82);
	}
	.flash {
		animation: keyflash 900ms ease-out;
	}
	@keyframes keyflash {
		0%,
		30% {
			fill: var(--mustard);
		}
	}
</style>
