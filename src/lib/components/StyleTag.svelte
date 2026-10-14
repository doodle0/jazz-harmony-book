<script lang="ts">
	import type { Style } from '#lib/audio/types.ts';
	import { STYLE_EMOJI, STYLE_LABEL } from '#lib/music/example.ts';

	const COLORS: Record<Style, string> = {
		swing: 'var(--mustard)',
		bebop: 'var(--tomato)',
		'hard-bop': 'var(--tomato)',
		ballad: 'var(--plum)',
		waltz: 'var(--sky)',
		blues: 'var(--sky)',
		bossa: 'var(--leaf)',
		samba: 'var(--leaf)',
		latin: 'var(--teal)',
		modal: 'var(--teal)',
		smooth: 'var(--sky)',
		funk: 'var(--tomato)',
		soul: 'var(--plum)',
		pad: 'var(--paper-2)'
	};

	let { style, extra }: { style: Style; extra?: string } = $props();
</script>

<span class="tag" style:background={COLORS[style]}>
	<span aria-hidden="true">{STYLE_EMOJI[style]}</span>
	{STYLE_LABEL[style]}{#if extra}<span class="font-medium opacity-80">· {extra}</span>{/if}
</span>
