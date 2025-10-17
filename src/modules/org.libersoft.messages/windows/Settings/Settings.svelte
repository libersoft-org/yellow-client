<script lang="ts">
	import BaseSettingsWindow from '@/core/components/Settings/BaseSettingsWindow.svelte';
	import type { ISettingsNode, IBaseSettingsInstance } from '@/core/types/settings.ts';
	import MessagesSettings from './MessagesSettings.svelte';
	let elBaseSettings: IBaseSettingsInstance;
	let settingsObject: ISettingsNode = {
		title: 'Messages settings',
		name: 'settings',
		body: MessagesSettings,
	};

	export function open() {
		elBaseSettings.open();
	}

	export function close() {
		elBaseSettings.close();
	}
</script>

<BaseSettingsWindow {settingsObject} bind:this={elBaseSettings} testId="messages-settings" />
