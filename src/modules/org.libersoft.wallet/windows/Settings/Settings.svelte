<script lang="ts">
	import { settingsWindow } from '@/org.libersoft.wallet/scripts/ui';
	import BaseSettingsWindow from '@/core/components/Settings/BaseSettingsWindow.svelte';
	import type { ISettingsObject, IBaseSettingsInstance } from '@/core/types/settings.ts';

	import { settingsObject } from '@/org.libersoft.wallet/scripts/settings.ts';

	let elBaseSettings: IBaseSettingsInstance;

	$effect(() => {
		settingsWindow.set(elBaseSettings);
	});
</script>

<BaseSettingsWindow testId="wallet-settings" settingsObject={$settingsObject} bind:this={elBaseSettings} />
