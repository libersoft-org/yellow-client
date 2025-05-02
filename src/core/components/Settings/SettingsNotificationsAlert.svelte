<script lang="ts">
 import { notificationsSettingsAlert } from '../../notifications_settings.ts';
 import Alert from '../Alert/Alert.svelte';
</script>

{#if $notificationsSettingsAlert}
 <Alert type="error" message="Notifications are blocked by the browser." />
{/if}
