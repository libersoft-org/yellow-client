<script lang="ts">
	import BaseSettings from '@/core/components/Settings/BaseSettings.svelte';
	import MessagesSettings from './MessagesSettings.svelte';
	let settingsObject = {
		title: 'Messages settings',
		name: 'settings',
		body: MessagesSettings,
	};
</script>

<BaseSettings {settingsObject} />
