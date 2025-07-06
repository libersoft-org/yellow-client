<script lang="ts">
	import { notificationsSettingsAlert } from '@/core/scripts/notifications_settings.ts';
	import Alert from '@/core/components/Alert/Alert.svelte';
</script>

{#if $notificationsSettingsAlert === 'blocked'}
	<Alert type="error" message="Notifications are blocked by the browser." />
{:else if $notificationsSettingsAlert === 'not-supported'}
	<Alert type="warning" message="Notifications are not supported in this browser." />
{/if}
