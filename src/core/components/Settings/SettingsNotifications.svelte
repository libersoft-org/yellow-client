<script>
 import { onMount, onDestroy, tick } from 'svelte';
 import Table from '../Table/Table.svelte';
 import TableTBodyTr from '../Table/TableTBodyTr.svelte';
 import TableTBody from '../Table/TableTBody.svelte';
 import TableTBodyTd from '../Table/TableTBodyTd.svelte';
 import Switch from '../Switch/Switch.svelte';
 import Select from '../Select/Select.svelte';
 import SelectOption from '../Select/SelectOption.svelte';
 import CornerSelector from '@/core/components/CornerSelector/CornerSelector.svelte';
 import { writable, get } from 'svelte/store';
 import { selectedMonitorName, selectedNotificationsCorner, enableCustomNotifications, customNotificationsOn, animationDuration, animationName, bgColor, titleColor, descColor } from '../../notifications_settings.ts';
 import { availableMonitors } from '@tauri-apps/api/window';
 import { notificationsEnabled, notificationsSettingsAlert, isRequestingNotificationsPermission } from '../../notifications_settings.ts';
 import { setNotificationsEnabled } from '../../notifications.ts';
 import { log, CUSTOM_NOTIFICATIONS, BROWSER } from '../../tauri.ts';
 import { addNotification, deleteNotification } from '../../notifications.ts';

 // Local monitors store for this component
 let monitors = writable([]);
 let monitorInterval;
 let monitorOptions = writable([]);
 let exampleNotification = 'dummy';

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
 <TableTBody>
  <TableTBodyTr>
   <TableTBodyTd>
    <div class="bold">Notifications:</div>
   </TableTBodyTd>
   <TableTBodyTd center={true}>
    <Switch bind:checked={_notificationsEnabled} />
   </TableTBodyTd>
  </TableTBodyTr>
  {#if $notificationsSettingsAlert}
   <TableTBodyTr>
    <TableTBodyTd colspan="2">
     <div class="alert">Notifications are blocked by the browser.</div>
    </TableTBodyTd>
   </TableTBodyTr>
  {/if}
  {#if CUSTOM_NOTIFICATIONS}
   <TableTBodyTr>
    <TableTBodyTd>
     <div class="bold">Custom notifications:</div>
    </TableTBodyTd>
    <TableTBodyTd center={true}>
     <Switch bind:checked={$enableCustomNotifications} />
    </TableTBodyTd>
   </TableTBodyTr>
   {#if $customNotificationsOn}
    <TableTBodyTr>
     <TableTBodyTd>
      <div class="bold">Monitor:</div>
     </TableTBodyTd>
     <TableTBodyTd center={true}>
      <Select bind:value={$selectedMonitorName}>
       {#each $monitorOptions as monitor}
        <SelectOption value={monitor.name} selected={monitor.name === $selectedMonitorName} text={monitor.label} />
       {/each}
      </Select>
     </TableTBodyTd>
    </TableTBodyTr>
    <TableTBodyTr>
     <TableTBodyTd>
      <div class="bold">Corner:</div>
     </TableTBodyTd>
     <TableTBodyTd center={true}>
      <CornerSelector bind:value={$selectedNotificationsCorner} />
     </TableTBodyTd>
    </TableTBodyTr>
    <TableTBodyTr>
     <TableTBodyTd>
      <div class="bold">Animation:</div>
     </TableTBodyTd>
     <TableTBodyTd center={true}>
      <Select>
       <SelectOption value="none" text="None" />
       <SelectOption value="zoom" text="Zoom" />
       <SelectOption value="opacity" text="Opacity" />
      </Select>
     </TableTBodyTd>
    </TableTBodyTr>
    <TableTBodyTr>
     <TableTBodyTd>
      <div class="bold">Background color:</div>
     </TableTBodyTd>
     <TableTBodyTd center={true}>
      <input type="color" bind:value={$bgColor} />
      {$bgColor}
     </TableTBodyTd>
    </TableTBodyTr>
    <TableTBodyTr>
     <TableTBodyTd>
      <div class="bold">Title color:</div>
     </TableTBodyTd>
     <TableTBodyTd center={true}>
      <input type="color" bind:value={$titleColor} />
      {$titleColor}
     </TableTBodyTd>
    </TableTBodyTr>
    <TableTBodyTr>
     <TableTBodyTd>
      <div class="bold">Description color:</div>
     </TableTBodyTd>
     <TableTBodyTd center={true}>
      <input type="color" bind:value={$descColor} />
      {$descColor}
     </TableTBodyTd>
    </TableTBodyTr>
   {/if}
  {/if}
 </TableTBody>
</Table>
