<script>
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

 // Local monitors store for this component
 let monitors = writable<Monitor[]>([]);
 let monitorInterval: Timer | undefined;
 let permissionInterval: Timer | undefined;
 let monitorOptions = writable<any[]>([]);

 // Store all subscription unsubscribe functions
 const unsubscribers: Unsubscriber[] = [];

 // Helper to add subscriptions and track unsubscribers
 function addSubscription<T>(store: { subscribe: (callback: (value: T) => void) => Unsubscriber }, callback: (value: T) => void): void {
  const unsubscribe = store.subscribe(callback);
  unsubscribers.push(unsubscribe);
 }

 // Subscribe to monitors and keep unsubscribe function
 addSubscription(monitors, value => {
  monitorOptions.set(
   [
    //{ name: 'primary', label: 'primary' },
    { name: 'main_window_monitor', label: 'Main window monitor' },
   ].concat(value.map((m: any) => ({ name: m.name, label: m.name + '(' + m.size.width + 'x' + m.size.height + ')' })))
  );
 });

 let _notificationsEnabled = get(notificationsEnabled);

 // Add all store subscriptions with the tracking helper
 addSubscription(selectedMonitorName, v => {
  log.debug('selectedMonitor:', v);
  updateExampleNotification();
 });

 addSubscription(selectedNotificationsCorner, v => {
  log.debug('selectedNotificationsCorner:', v);
  updateExampleNotification();
 });

 addSubscription(enableCustomNotifications, v => {
  log.debug('enableCustomNotifications:', v);
  updateExampleNotification();
 });

 addSubscription(notificationsEnabled, value => {
  _notificationsEnabled = value;
  log.debug('notificationsEnabled:', value);
  updateExampleNotification();
 });

 $: updateNotificationsEnabled(_notificationsEnabled);
</script>

<TableTBodyTr>
 <TableTBodyTd>
  <div class="bold">Notifications:</div>
 </TableTBodyTd>
 <TableTBodyTd center={true}>
  <Switch bind:checked={_notificationsEnabled} />
 </TableTBodyTd>
</TableTBodyTr>
<TableTBodyTr>
 <TableTBodyTd>
  <div class="bold">Notification sound:</div>
 </TableTBodyTd>
 <TableTBodyTd center={true}>
  <Switch bind:checked={$notificationsSoundEnabled} />
 </TableTBodyTd>
</TableTBodyTr>
{#if $notificationsSettingsAlert}
 <TableTBodyTr>
  <TableTBodyTd colspan={2}>
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
    {#if $debug}$selectedMonitorName:{$selectedMonitorName}{/if}
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
 {/if}
{/if}
