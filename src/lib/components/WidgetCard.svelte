<script lang="ts">
	// Every widget is a full-width card: a colored header band, the style tag of the
	// current example, the interactive body, and a row of big controls.
	import type { Snippet } from 'svelte';
	import type { Example } from '#lib/music/example.ts';
	import StyleTag from './StyleTag.svelte';

	let {
		title,
		kicker = '들어 보기',
		color = 'var(--teal)',
		example,
		summary,
		children,
		controls
	}: {
		title: string;
		kicker?: string;
		color?: string;
		example?: Example;
		summary?: string;
		children: Snippet;
		controls?: Snippet;
	} = $props();
</script>

<section class="widget chunky not-prose overflow-hidden" aria-label={title}>
	<header class="relative border-b-[2.5px] border-ink px-4 pt-3 pb-3" style:background={color}>
		<div class="text-xs font-bold tracking-wider text-on-color/80 uppercase">♪ {kicker}</div>
		<h3 class="font-display text-xl leading-snug text-on-color">{title}</h3>
		<!-- decorative record -->
		<div
			aria-hidden="true"
			class="absolute top-2 right-3 grid size-11 place-items-center rounded-full border-2 border-ink bg-ink"
			style:background="repeating-radial-gradient(circle, #1e1a16 0 2px, #2c2621 2px 4px)"
		>
			<div class="size-3.5 rounded-full border-2 border-ink" style:background="var(--mustard)"></div>
		</div>
	</header>

	{#if example}
		<div class="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 pt-3 text-sm">
			<StyleTag style={example.style} extra={example.era} />
			{#if example.tune}
				<span class="text-ink-soft">
					<em class="font-semibold not-italic">{example.tune.title}</em>{#if example.tune.composer}
						· {example.tune.composer}{/if}{#if example.tune.year}
						({example.tune.year}){/if}
				</span>
			{:else}
				<span class="text-ink-soft">{example.title}</span>
			{/if}
		</div>
	{/if}

	<div class="px-4 py-3">
		{@render children()}
	</div>

	{#if summary}
		<p class="mx-4 mb-3 rounded-xl bg-paper-2 px-3 py-2 text-sm leading-relaxed text-ink-soft">{summary}</p>
	{/if}

	{#if controls}
		<div class="flex flex-wrap items-center gap-2.5 border-t-2 border-dashed border-ink/25 px-4 py-3">
			{@render controls()}
		</div>
	{/if}
</section>
