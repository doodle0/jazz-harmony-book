<script lang="ts">
	import Segmented from './Segmented.svelte';
	import { settings, type LabelMode, type Theme } from '#lib/stores/settings.svelte.ts';
	import { player } from '#lib/stores/player.svelte.ts';
	import type { VoicingStyle } from '#lib/theory/voicing.ts';
	import { t } from '#lib/messages/index.ts';
	import { Volume2 } from '@lucide/svelte';
</script>

<div class="space-y-6">
	<div>
		<div class="mb-2 font-bold">{t('settings.volume')}</div>
		<div class="flex items-center gap-3">
			<Volume2 size={20} />
			<input
				type="range"
				min="0"
				max="1"
				step="0.05"
				value={settings.volume}
				oninput={(e) => player.setVolume(Number(e.currentTarget.value))}
				class="h-11 flex-1 accent-[var(--tomato)]"
				aria-label={t('settings.volume')}
			/>
		</div>
	</div>

	<div>
		<div class="mb-2 font-bold">{t('settings.labels')}</div>
		<Segmented
			label={t('settings.labels')}
			bind:value={settings.labels}
			options={[
				{ value: 'degree' as LabelMode, label: '1 3 5 ' + t('labels.degree') },
				{ value: 'letter' as LabelMode, label: 'C E G ' + t('labels.letter') },
				{ value: 'solfege' as LabelMode, label: '도 미 솔' }
			]}
		/>
		<p class="mt-1.5 text-xs text-ink-soft">도레미는 이동도(키 기준)입니다. A 키에서 D는 파, G♯은 시.</p>
	</div>

	<div>
		<div class="mb-2 font-bold">{t('settings.voicing')}</div>
		<Segmented
			label={t('settings.voicing')}
			bind:value={settings.voicing}
			options={[
				{ value: 'spread' as VoicingStyle, label: t('voicing.spread') },
				{ value: 'rootless' as VoicingStyle, label: t('voicing.rootless') },
				{ value: 'shell' as VoicingStyle, label: t('voicing.shell') },
				{ value: 'close' as VoicingStyle, label: t('voicing.close') }
			]}
		/>
		<p class="mt-1.5 text-xs text-ink-soft">별도로 정해진 보이싱이 없는 예시에 쓰입니다. 두 손: 왼손은 3도와 7도, 오른손은 텐션, 근음은 베이스가 맡습니다.</p>
	</div>

	<div>
		<div class="mb-2 font-bold">{t('settings.theme')}</div>
		<Segmented
			label={t('settings.theme')}
			bind:value={settings.theme}
			options={[
				{ value: 'auto' as Theme, label: '🌗 ' + t('settings.theme.auto') },
				{ value: 'light' as Theme, label: '☀️ ' + t('settings.theme.light') },
				{ value: 'dark' as Theme, label: '🌙 ' + t('settings.theme.dark') }
			]}
		/>
	</div>
</div>
