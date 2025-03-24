<script>
 import { onMount, onDestroy } from 'svelte';
 import Table from './table.svelte';
 import Tr from './table-tbody-tr.svelte';
 import Tbody from './table-tbody.svelte';
 import Td from './table-tbody-td.svelte';
 import CornerSelector from './cornerselector.svelte';
 import { writable, get } from 'svelte/store';
 import { selectedMonitor, selectedNotificationsCorner, enableCustomNotifications } from '../notifications_settings.ts';
 import { availableMonitors } from '@tauri-apps/api/window';
 import { notificationsEnabled, setNotificationsEnabled, notificationsSettingsAlert } from '../core.js';
 import { log, CUSTOM_NOTIFICATIONS } from '../tauri.ts';
 import Switch from './switch.svelte';
 import { addNotification, deleteNotification } from '../notifications.ts';

 // Local monitors store for this component
 let monitors = writable([]);
 let monitorInterval;
 let exampleNotification = 'dummy';

 function updateExampleNotification() {
  if (!exampleNotification) {
   exampleNotification = addNotification({
    body: 'This is an example notification',
    callback: event => {
     deleteNotification(exampleNotification);
     exampleNotification = null;
    },
   });
  }
 }

 onDestroy(() => {
  if (exampleNotification && exampleNotification !== 'dummy') {
   deleteNotification(exampleNotification);
  }
 });

 selectedMonitor.subscribe(v => {
  log.debug('selectedMonitor:', v);
  updateExampleNotification();
 });

 selectedNotificationsCorner.subscribe(v => {
  log.debug('selectedNotificationsCorner:', v);
  updateExampleNotification();
 });

 enableCustomNotifications.subscribe(v => {
  log.debug('enableCustomNotifications:', v);
  updateExampleNotification();
 });

 // Notifications settings
 let _notificationsEnabled = get(notificationsEnabled);
 notificationsEnabled.subscribe(value => {
  _notificationsEnabled = value;
  console.log('notificationsEnabled:', value);
  updateExampleNotification();
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
   updateMonitors();
   monitorInterval = setInterval(updateMonitors, 1000);
  }
  log.debug('SettingsNotifications mounted');
  exampleNotification = null;
 });

 onDestroy(() => {
  if (monitorInterval) {
   clearInterval(monitorInterval);
  }
 });

 async function updateMonitors() {
  let mons = await availableMonitors();
  //log.debug('updateMonitors:', mons);
  monitors.set(mons);
 }
</script>

<Table>
 <Tbody>
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
  {#if CUSTOM_NOTIFICATIONS}
   <Tr>
    <Td>
     <div class="bold">Custom notifications:</div>
    </Td>
    <Td center={true}>
     <Switch bind:checked={$enableCustomNotifications} />
    </Td>
   </Tr>
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
