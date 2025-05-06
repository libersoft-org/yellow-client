<script lang="ts">
 import { notificationsSettingsAlert } from '../../notifications_settings.ts';
 import Alert, { Type } from '../Alert/Alert.svelte';
</script>

{#if $notificationsSettingsAlert}
 <Alert type={Type.ERROR} message="Notifications are blocked by the browser." />
{/if}
