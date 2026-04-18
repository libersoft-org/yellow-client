<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { settingsWindow } from '@/org.libersoft.wallet/scripts/ui';
	import BaseSettingsWindow from '@/core/components/Settings/BaseSettingsWindow.svelte';
	import type { IBaseSettingsInstance } from '@/core/types/settings.ts';
	import { settingsObject } from '@/org.libersoft.wallet/scripts/settings.ts';
	let elBaseSettings: IBaseSettingsInstance;

	onMount(() => {
		settingsWindow.set(elBaseSettings);
	});

	onDestroy(() => {
		settingsWindow.set(null);
	});
</script>

<BaseSettingsWindow testId="wallet-settings" settingsObject={$settingsObject} bind:this={elBaseSettings} />
