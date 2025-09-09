<script lang="ts">
	import BaseSettings from '@/core/components/Settings/BaseSettings.svelte';
	import type { ISettingsObject, IBaseSettingsInstance } from '@/core/types/settings.ts';
	import MessagesSettings from './MessagesSettings.svelte';
	let elBaseSettings: IBaseSettingsInstance;
	let settingsObject: ISettingsObject = {
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

<BaseSettings {settingsObject} bind:this={elBaseSettings} testId="messages-settings" />
