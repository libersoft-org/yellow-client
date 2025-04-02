<script>
 import { onMount, onDestroy, tick } from 'svelte';
 import Table from './table.svelte';
 import Tr from './table-tbody-tr.svelte';
 import Tbody from './table-tbody.svelte';
 import Td from './table-tbody-td.svelte';
 import CornerSelector from './cornerselector.svelte';
 import { writable, get } from 'svelte/store';
 import { selectedMonitorName, selectedNotificationsCorner, enableCustomNotifications, customNotificationsOn, animationDuration, animationName, bgColor, titleColor, descColor } from '../notifications_settings.ts';
 import { availableMonitors } from '@tauri-apps/api/window';
 import { notificationsEnabled, setNotificationsEnabled, notificationsSettingsAlert, isRequestingNotificationsPermission } from '../core.js';
 import { log, CUSTOM_NOTIFICATIONS, BROWSER } from '../tauri.ts';
 import Switch from './switch.svelte';
 import { addNotification, deleteNotification } from '../notifications.ts';

 // Local monitors store for this component
 let monitors = writable([]);
 let monitorInterval;
 let exampleNotification = 'dummy';
 let monitorOptions = writable([]);

 monitors.subscribe(value => {
  monitorOptions.set(
   [
    //{ name: 'primary', label: 'primary' },
    { name: 'main_window_monitor', label: 'Main window monitor' },
   ].concat(value.map(m => ({ name: m.name, label: m.name + '(' + m.size.width + 'x' + m.size.height + ')' })))
  );
 });

 function updateExampleNotification() {
  if (exampleNotification === 'dummy') return;
  if (exampleNotification) {
   deleteNotification(exampleNotification);
   exampleNotification = null;
  }

  exampleNotification = addNotification({
   title: 'Example',
   body: 'This is an example notification',
   callback: event => {
    deleteNotification(exampleNotification);
    exampleNotification = null;
   },
  });
 }

 onDestroy(() => {
  if (exampleNotification && exampleNotification !== 'dummy') {
   deleteNotification(exampleNotification);
  }
 });

 selectedMonitorName.subscribe(v => {
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
  if (BROWSER) {
   setInterval(() => {
    if (get(isRequestingNotificationsPermission)) return;

    if (Notification.permission === 'granted') {
     notificationsSettingsAlert.set('');
    } else {
     if (get(notificationsEnabled)) {
      notificationsSettingsAlert.set('blocked');
     }
     notificationsEnabled.set(get(notificationsEnabled) && Notification.permission === 'granted');
    }
   }, 1000);
  }
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

<Table expand={true}>
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
   {#if $customNotificationsOn}
    <Tr>
     <Td>
      <div class="bold">Monitor:</div>
     </Td>
     <Td center={true}>
      <select bind:value={$selectedMonitorName} disabled={!$customNotificationsOn}>
       {#each $monitorOptions as monitor}
        <option value={monitor.name} selected={monitor.name === $selectedMonitorName}>{monitor.label}</option>
       {/each}
      </select>
     </Td>
    </Tr>
    <Tr>
     <Td>
      <div class="bold">Corner:</div>
     </Td>
     <Td center={true}>
      <CornerSelector bind:value={$selectedNotificationsCorner} disabled={!$customNotificationsOn} />
     </Td>
    </Tr>
    <Tr>
     <Td>
      <div class="bold">Background color:</div>
     </Td>
     <Td center={true}>
      <input type="color" bind:value={$bgColor} />
      {$bgColor}
     </Td>
    </Tr>
    <Tr>
     <Td>
      <div class="bold">Title color:</div>
     </Td>
     <Td center={true}>
      <input type="color" bind:value={$titleColor} />
      {$titleColor}
     </Td>
    </Tr>
    <Tr>
     <Td>
      <div class="bold">Description color:</div>
     </Td>
     <Td center={true}>
      <input type="color" bind:value={$descColor} />
      {$descColor}
     </Td>
    </Tr>
   {/if}
  {/if}
 </Tbody>
</Table>
