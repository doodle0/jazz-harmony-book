<script lang="ts">
	// Sticky mini-player: what's playing, stop/loop, tempo and key (plan §5).
	// The key starts at the example's usual key (원키); changing it transposes only the current example.
	import { Play, Square, Repeat, LoaderCircle, ChevronDown, Minus, Plus } from '@lucide/svelte';
	import { player } from '#lib/stores/player.svelte.ts';
	import { allKeys, keyShortName, sameKey } from '#lib/theory/progression.ts';
	import { STYLE_EMOJI } from '#lib/music/example.ts';
	import { t } from '#lib/messages/index.ts';
	import Sheet from './Sheet.svelte';

	let sheetOpen = $state(false);
	let src = $derived(player.source);
	let isUsual = $derived(!!(src && player.key && sameKey(src.usualKey, player.key)));
	let keys = $derived(allKeys(src?.usualKey.minor ?? false));
</script>

<div class="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
	<div
		class="pointer-events-auto mx-auto flex max-w-[640px] items-center gap-2 rounded-[22px] border-[2.5px] border-ink bg-ink p-1.5 pr-2 text-paper shadow-[4px_4px_0_var(--mustard)]"
		role="region"
		aria-label="미니 플레이어"
	>
		<button
			type="button"
			class="grid size-12 shrink-0 place-items-center rounded-full border-2 border-paper/80 text-on-color transition-transform active:scale-90"
			style:background={player.playing ? 'var(--mustard)' : 'var(--tomato)'}
			aria-label={player.playing ? t('play.stop') : t('play.hear')}
			disabled={!src}
			onclick={() => player.toggle()}
		>
			{#if player.loading}
				<LoaderCircle size={22} class="animate-[spin_0.9s_linear_infinite]" />
			{:else if player.playing}
				<Square size={18} fill="currentColor" />
			{:else}
				<Play size={22} fill="currentColor" />
			{/if}
		</button>

		<div class="min-w-0 flex-1">
			{#if src}
				<div class="truncate text-sm font-bold">
					{#if src.style}<span aria-hidden="true">{STYLE_EMOJI[src.style]}</span>{/if}
					{src.title}
				</div>
				<div class="flex items-center gap-1 text-xs text-paper/70">
					{#if player.loading}{t('play.loading')}{:else if player.playing}
						<span class="inline-flex gap-0.5" aria-hidden="true">
							{#each [0, 1, 2] as i (i)}
								<span class="eq inline-block w-[3px] rounded-sm bg-mustard" style:animation-delay="{i * 0.15}s"></span>
							{/each}
						</span>
						재생 중
					{:else}멈춤{/if}
				</div>
			{:else}
				<div class="text-xs leading-snug text-paper/75">{t('play.idle')}</div>
			{/if}
		</div>

		{#if src}
			<button
				type="button"
				class="flex min-h-11 items-center gap-1 rounded-full border-2 border-paper/60 px-2.5 text-sm font-bold"
				onclick={() => (sheetOpen = true)}
				aria-label="키와 템포"
			>
				{#if player.key}{keyShortName(player.key)}{/if}
				{#if isUsual}<span class="rounded-full bg-mustard px-1.5 text-[0.65rem] text-on-color">{t('play.usualKey')}</span>{/if}
				<span class="text-paper/70">♩{player.tempo}</span>
				<ChevronDown size={14} />
			</button>
			<button
				type="button"
				class="grid size-11 place-items-center rounded-full border-2 {player.loop ? 'border-mustard text-mustard' : 'border-paper/40 text-paper/40'}"
				aria-pressed={player.loop}
				aria-label={t('play.loop')}
				onclick={() => player.setLoop(!player.loop)}
			>
				<Repeat size={18} />
			</button>
		{/if}
	</div>
</div>

<Sheet bind:open={sheetOpen} title="키와 템포">
	{#if src}
		<p class="mb-3 text-sm text-ink-soft">
			<b>{src.title}</b>의 키를 바꿉니다. 다음 예시는 다시 자기 원키에서 시작해요.
		</p>
		{#if src.transposable !== false}
			<div class="grid grid-cols-4 gap-2" role="radiogroup" aria-label={t('key.pick')}>
				{#each keys as k (keyShortName(k))}
					{@const on = !!player.key && sameKey(player.key, k)}
					{@const usual = sameKey(src.usualKey, k)}
					<button
						type="button"
						role="radio"
						aria-checked={on}
						class="btn relative !px-0 text-lg"
						style:background={on ? 'var(--mustard)' : usual ? 'var(--paper-2)' : 'var(--card)'}
						onclick={() => player.setKey(k)}
					>
						{keyShortName(k)}
						{#if usual}<span class="absolute -top-2 -right-1 rounded-full border-2 border-ink bg-tomato px-1 text-[0.6rem] text-on-color">원키</span>{/if}
					</button>
				{/each}
			</div>
		{/if}
		<div class="mt-6">
			<div class="mb-2 font-bold">{t('play.tempo')} <span class="font-display text-2xl">♩ = {player.tempo}</span></div>
			<div class="flex items-center gap-3">
				<button type="button" class="btn" aria-label="느리게" onclick={() => player.setTempo(player.tempo - 8)}><Minus size={18} /></button>
				<input
					type="range"
					min="40"
					max="280"
					step="4"
					value={player.tempo}
					oninput={(e) => player.setTempo(Number(e.currentTarget.value))}
					class="tempo h-11 flex-1"
					aria-label={t('play.tempo')}
				/>
				<button type="button" class="btn" aria-label="빠르게" onclick={() => player.setTempo(player.tempo + 8)}><Plus size={18} /></button>
			</div>
			<button type="button" class="mt-3 text-sm font-bold text-teal underline" onclick={() => src && player.setTempo(src.tempo)}>
				원래 템포 ({src.tempo})로
			</button>
		</div>
	{/if}
</Sheet>

<style>
	.eq {
		height: 10px;
		animation: eq 0.6s ease-in-out infinite alternate;
	}
	@keyframes eq {
		from {
			transform: scaleY(0.3);
		}
		to {
			transform: scaleY(1);
		}
	}
	.tempo {
		accent-color: var(--tomato);
	}
</style>
