<script lang="ts">
	// Drawer on bits-ui Dialog: 'left' for the TOC, 'bottom' for settings and pickers.
	import { Dialog } from 'bits-ui';
	import { X } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		side = 'bottom',
		title,
		children
	}: { open?: boolean; side?: 'left' | 'bottom'; title: string; children: Snippet } = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" />
		<Dialog.Content
			class="sheet fixed z-50 flex flex-col overflow-hidden border-ink bg-card text-ink outline-none {side === 'left'
				? 'sheet-left inset-y-0 left-0 w-[86vw] max-w-[360px] border-r-[2.5px]'
				: 'sheet-bottom inset-x-0 bottom-0 mx-auto max-h-[85vh] max-w-[640px] rounded-t-[26px] border-[2.5px] border-b-0'}"
		>
			{#if side === 'bottom'}
				<div class="mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-ink/25"></div>
			{/if}
			<div class="flex items-center justify-between px-5 pt-3 pb-2">
				<Dialog.Title class="font-display text-2xl">{title}</Dialog.Title>
				<Dialog.Close class="btn !min-h-10 !min-w-10 !px-0" aria-label="닫기"><X size={20} /></Dialog.Close>
			</div>
			<div class="overflow-y-auto px-5 pb-8">
				{@render children()}
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	:global(.sheet-left) {
		animation: slide-left 220ms cubic-bezier(0.2, 0.9, 0.3, 1.2);
	}
	:global(.sheet-bottom) {
		animation: slide-up 240ms cubic-bezier(0.2, 0.9, 0.3, 1.15);
		box-shadow: 0 -6px 0 var(--shadow);
	}
	@keyframes slide-left {
		from {
			transform: translateX(-100%);
		}
	}
	@keyframes slide-up {
		from {
			transform: translateY(100%);
		}
	}
</style>
