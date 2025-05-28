<script>
 import Button from '@/core/components/Button/Button.svelte';
 import Switch from '@/core/components/Switch/Switch.svelte';
 import { addNotification } from '../../notifications.ts';
 import { debug } from '../../core.js';
 import { log } from '../../tauri.ts';

 async function err() {
  throw new Error('Test exception!');
 }

 async function notification() {
  //log.debug('addNotification...');
  await addNotification({
   body: 'Notification body',
   callback: event => {
    log.debug('Debug notification callback: ' + event);
   },
  });
 }
</script>

{#if import.meta.env.VITE_YELLOW_CLIENT_DEBUG}(debug:<Switch bind:checked={$debug} />){/if}
{#if $debug}
 <Button onClick={err}>0</Button>
 <Button onClick={notification}>Notif</Button>
{/if}
