<script lang="ts" generics="T extends string">
	// Segmented control (used for A/B toggles and small choices). Tap targets ≥ 44px.
	let {
		value = $bindable(),
		options,
		label,
		size = 'md',
		onchange
	}: {
		value: T;
		options: { value: T; label: string; color?: string }[];
		label: string;
		size?: 'sm' | 'md';
		onchange?: (v: T) => void;
	} = $props();
</script>

<div
	role="radiogroup"
	aria-label={label}
	class="inline-flex max-w-full flex-wrap gap-0.5 rounded-[22px] border-2 border-ink bg-paper-2 p-1 shadow-[3px_3px_0_var(--shadow)]"
>
	{#each options as o (o.value)}
		{@const on = o.value === value}
		<button
			type="button"
			role="radio"
			aria-checked={on}
			class="flex-auto rounded-full px-3.5 font-bold transition-all {size === 'sm' ? 'min-h-9 text-sm' : 'min-h-10'} {on
				? 'border-2 border-ink text-on-color'
				: 'border-2 border-transparent text-ink-soft'}"
			style:background={on ? (o.color ?? 'var(--mustard)') : 'transparent'}
			onclick={() => {
				value = o.value;
				onchange?.(o.value);
			}}
		>
			{o.label}
		</button>
	{/each}
</div>
