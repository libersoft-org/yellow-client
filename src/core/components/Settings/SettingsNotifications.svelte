<script lang="ts">
 import { onMount, onDestroy, tick } from 'svelte';
 import Table from '../Table/Table.svelte';
 import TableTBodyTr from '../Table/TableTBodyTr.svelte';
 import TableTBody from '../Table/TableTBody.svelte';
 import TableTBodyTd from '../Table/TableTBodyTd.svelte';
 import Input from '../Input/Input.svelte';
 import Switch from '../Switch/Switch.svelte';
 import Select from '../Select/Select.svelte';
 import SelectOption from '../Select/SelectOption.svelte';
 import CornerSelector from '@/core/components/CornerSelector/CornerSelector.svelte';
 import { writable, get, type Unsubscriber } from 'svelte/store';
 import { selectedMonitorName, selectedNotificationsCorner, enableCustomNotifications, customNotificationsOn, animationDuration, animationName, titleMaxLines, bodyMaxLines, bgColor, bgColorHover, borderColor, titleColor, descColor, notificationsSoundEnabled } from '../../notifications_settings.ts';
 import { availableMonitors, type Monitor } from '@tauri-apps/api/window';
 import { notificationsEnabled, notificationsSettingsAlert, isRequestingNotificationsPermission } from '../../notifications_settings.ts';
 import { setNotificationsEnabled } from '../../notifications.ts';
 import { log, CUSTOM_NOTIFICATIONS, BROWSER } from '../../tauri.ts';
 import { addNotification, deleteNotification } from '../../notifications.ts';
 import { debug } from '@/core/core.js';
 import SettingsNotificationsBasic from '@/core/components/Settings/SettingsNotificationsBasic.svelte';

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
   permissionInterval = setInterval(() => {
    log.debug('permissionInterval:', Notification.permission);
    if (get(isRequestingNotificationsPermission)) return;

    if (Notification.permission === 'granted') {
     notificationsSettingsAlert.set('');
    } else {
     if (get(notificationsEnabled)) {
      notificationsSettingsAlert.set('blocked');
     }
     notificationsEnabled.set(Boolean(get(notificationsEnabled)));
    }
   }, 1000);
  }
 });

 onDestroy(() => {
  // Clean up all store subscriptions
  unsubscribers.forEach(unsubscribe => unsubscribe());

  // Clear intervals
  if (monitorInterval) {
   clearInterval(monitorInterval);
  }
  if (permissionInterval) {
   clearInterval(permissionInterval);
  }

  // Clean up any existing notification
  if (exampleNotification && exampleNotification !== 'dummy') {
   deleteNotification(exampleNotification);
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
  <SettingsNotificationsBasic />

  {#if CUSTOM_NOTIFICATIONS}
   {#if $customNotificationsOn}
    <TableTBodyTr>
     <TableTBodyTd>
      <div class="bold">Animation:</div>
     </TableTBodyTd>
     <TableTBodyTd center={true}>
      <Select bind:value={$animationName}>
       <SelectOption value="none" text="None" />
       <SelectOption value="zoom" text="Zoom" />
       <SelectOption value="opacity" text="Opacity" />
      </Select>
     </TableTBodyTd>
    </TableTBodyTr>

    <TableTBodyTr>
     <TableTBodyTd>
      <div class="bold">Maximum number of lines in title:</div>
     </TableTBodyTd>
     <TableTBodyTd center={true}>
      <Input type="number" bind:value={$titleMaxLines} min={1} max={3} />
     </TableTBodyTd>
    </TableTBodyTr>

    <TableTBodyTr>
     <TableTBodyTd>
      <div class="bold">Maximum number of lines in description:</div>
     </TableTBodyTd>
     <TableTBodyTd center={true}>
      <Input type="number" bind:value={$bodyMaxLines} min={1} max={5} />
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
      <div class="bold">Background color on mouse over:</div>
     </TableTBodyTd>
     <TableTBodyTd center={true}>
      <input type="color" bind:value={$bgColorHover} />
      {$bgColorHover}
     </TableTBodyTd>
    </TableTBodyTr>
    <TableTBodyTr>
     <TableTBodyTd>
      <div class="bold">Border color:</div>
     </TableTBodyTd>
     <TableTBodyTd center={true}>
      <input type="color" bind:value={$borderColor} />
      {$borderColor}
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
