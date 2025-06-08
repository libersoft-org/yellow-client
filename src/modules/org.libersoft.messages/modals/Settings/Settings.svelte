<script lang="ts">
	import BaseSettings from '@/core/components/Settings/BaseSettings.svelte';
	import MessagesSettings from './MessagesSettings.svelte';
	interface Props {
		show?: boolean;
	}
	let { show = false }: Props = $props();
	let settingsObject = {
		title: 'Messages settings',
		name: 'settings',
		body: MessagesSettings,
	};
</script>

<BaseSettings {settingsObject} bind:show />
