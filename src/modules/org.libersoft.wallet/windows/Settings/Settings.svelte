<script lang="ts">
	import { settingsWindow } from '@/org.libersoft.wallet/scripts/ui';
	import BaseSettings from '@/core/components/Settings/BaseSettings.svelte';
	import type { ISettingsObject, IBaseSettingsInstance } from '@/core/types/settings.ts';

	import { settingsObject } from '@/org.libersoft.wallet/scripts/settings.ts';

	let elBaseSettings: IBaseSettingsInstance;

	$effect(() => {
		settingsWindow.set(elBaseSettings);
	});
</script>

<BaseSettings testId="wallet-settings" settingsObject={$settingsObject} bind:this={elBaseSettings} />
