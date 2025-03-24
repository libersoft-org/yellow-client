<script>
 import { onMount, onDestroy } from 'svelte';
 import Table from './table.svelte';
 import Tr from './table-tbody-tr.svelte';
 import Tbody from './table-tbody.svelte';
 import Td from './table-tbody-td.svelte';
 import CornerSelector from './cornerselector.svelte';
 import { writable, get } from 'svelte/store';
 import { selectedMonitor, selectedNotificationsCorner } from '../notifications_settings.ts';
 import { availableMonitors } from '@tauri-apps/api/window';
 import { notificationsEnabled, setNotificationsEnabled, notificationsSettingsAlert } from '../core.js';
 import Switch from './switch.svelte';

 // Local monitors store for this component
 let monitors = writable([]);
 let monitorInterval;

 // Notifications settings
 let _notificationsEnabled = get(notificationsEnabled);
 notificationsEnabled.subscribe(value => {
  _notificationsEnabled = value;
 });
 $: updateNotificationsEnabled(_notificationsEnabled);

 async function updateNotificationsEnabled(value) {
  console.log('updateNotificationsEnabled value:', value);
  if (get(notificationsEnabled) === value) return;
  setNotificationsEnabled(value);
  let v = get(notificationsEnabled);
  if (v !== value) {
   await tick();
   _notificationsEnabled = v;
  }
 }

 onMount(() => {
  if (window.__TAURI__) {
   // Update monitors list only while settings panel is open
   updateMonitors();
   monitorInterval = setInterval(updateMonitors, 1000);
  }
 });

 onDestroy(() => {
  if (monitorInterval) {
   clearInterval(monitorInterval);
  }
 });

 async function updateMonitors() {
  monitors.set(await availableMonitors());
 }
</script>

<Table>
 <Tbody>
  {#if window.__TAURI__}
   <Tr>
    <Td>
     <div class="bold">Notifications:</div>
    </Td>
    <Td center={true}>
     <Switch bind:checked={_notificationsEnabled} />
    </Td>
   </Tr>
   {#if $notificationsSettingsAlert}
    <Tr>
     <Td colspan="2">
      <div class="alert">Notifications are blocked by the browser.</div>
     </Td>
    </Tr>
   {/if}
   <Tr>
    <Td>
     <div class="bold">Monitor:</div>
    </Td>
    <Td center={true}>
     <select bind:value={$selectedMonitor}>
      {#each $monitors as monitor}
       <option value={monitor.name}>{monitor.name} ({monitor.size.width}x{monitor.size.height})</option>
      {/each}
     </select>
    </Td>
   </Tr>
   <Tr>
    <Td>
     <div class="bold">Corner:</div>
    </Td>
    <Td center={true}>
     <CornerSelector bind:value={$selectedNotificationsCorner} />
    </Td>
   </Tr>
  {:else}
   <Tr>
    <Td>
     <div class="bold">Monitor:</div>
    </Td>
    <Td center={true}>
     <div class="alert alert-warning">This feature is only available in the desktop app</div>
    </Td>
   </Tr>
  {/if}
 </Tbody>
</Table>
