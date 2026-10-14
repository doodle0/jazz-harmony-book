<script lang="ts">
	// A mini lead sheet: bars with chord symbols on top and Roman numerals below
	// (the lecture's convention). The sounding chord lights up; tapping one plays it.
	import type { ResolvedChord } from '#lib/theory/progression.ts';

	let {
		chords,
		active = -1,
		show = 'both',
		onTap,
		barsPerRow = 4
	}: {
		chords: ResolvedChord[];
		active?: number;
		show?: 'both' | 'letters' | 'roman';
		onTap?: (index: number) => void;
		barsPerRow?: number;
	} = $props();

	let bars = $derived.by(() => {
		const out: { chord: ResolvedChord; index: number }[][] = [];
		chords.forEach((c, index) => {
			(out[c.bar] ??= []).push({ chord: c, index });
		});
		return out.filter(Boolean);
	});
</script>

<div class="grid gap-y-2" style:grid-template-columns="repeat({Math.min(barsPerRow, bars.length)}, minmax(0, 1fr))">
	{#each bars as bar, b (b)}
		<!-- a bar with several chords stacks them on phones, so each symbol gets the full bar width -->
		<div class="flex min-h-16 border-l-[3px] border-ink first:border-l-[3px] {bar.length > 1 ? 'flex-col sm:flex-row' : ''} {b % barsPerRow === Math.min(barsPerRow, bars.length) - 1 ? 'border-r-[3px]' : ''}">
			{#each bar as { chord, index } (index)}
				{@const on = index === active}
				<button
					type="button"
					class="flex min-w-0 flex-1 flex-col items-start justify-center rounded-lg px-1.5 py-1 text-left transition-all"
					style:background={on ? 'var(--mustard)' : 'transparent'}
					style:transform={on ? 'scale(1.04)' : ''}
					onclick={() => onTap?.(index)}
					aria-label="{chord.symbol} ({chord.romanLabel})"
				>
					{#if show !== 'roman'}
						<span class="max-w-full truncate text-[0.95rem] leading-tight font-extrabold {on ? 'text-on-color' : ''}">{chord.symbol}</span>
					{/if}
					{#if show !== 'letters'}
						<span
							class="max-w-full truncate font-serif leading-tight {show === 'roman' ? 'text-[0.95rem] font-bold' : bar.length > 1 ? 'text-[0.72rem]' : 'text-[0.78rem]'} {on
								? 'text-on-color'
								: 'text-ink-soft'}">{chord.romanLabel}</span
						>
					{/if}
				</button>
			{/each}
		</div>
	{/each}
</div>
