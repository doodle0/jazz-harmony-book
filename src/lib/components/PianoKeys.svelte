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
	// Tapping a key plays it.
	let {
		low = 48,
		high = 72,
		marks = {},
		flash = [],
		onTap,
		legend = true
	}: {
		low?: number;
		high?: number;
		marks?: Record<number, KeyMark>;
		/** keys that briefly light up (e.g. the note that changed) */
		flash?: number[];
		onTap?: (midi: number) => void;
		legend?: boolean;
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
					style:transform={pressed === k.midi ? 'translateY(0.06px)' : ''}
				/>
				{#if mark}
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
				/>
				{#if mark}
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
	</svg>
	{#if legend && usedKinds.length > 1}
		<div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-soft">
			{#each usedKinds as k (k)}
				<span class="inline-flex items-center gap-1">
					<span class="inline-block size-3 rounded-full border-[1.5px] border-ink" style:background={MARK_COLOR[k]}></span>
					{MARK_NAME[k]}
				</span>
			{/each}
		</div>
	{/if}
</div>

<style>
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
