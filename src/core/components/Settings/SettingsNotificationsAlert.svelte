<script lang="ts">
	import { notificationsSettingsAlert } from '../../notifications_settings.ts';
	import Alert, { Type } from '../Alert/Alert.svelte';
</script>

{#if $notificationsSettingsAlert === 'blocked'}
	<Alert type={Type.ERROR} message="Notifications are blocked by the browser." />
{:else if $notificationsSettingsAlert === 'not-supported'}
	<Alert type={Type.WARNING} message="Notifications are not supported in this browser." />
{/if}
