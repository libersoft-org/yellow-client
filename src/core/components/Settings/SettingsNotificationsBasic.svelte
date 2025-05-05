<script lang="ts">
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
 import { notificationsSettingsAlert, notificationsEnabled, isRequestingNotificationsPermission } from '../../notifications_settings.ts';
 import { setNotificationsEnabled } from '../../notifications.ts';
 import { log, CUSTOM_NOTIFICATIONS, BROWSER } from '../../tauri.ts';
 import { deleteNotification, updateExampleNotification, exampleNotifications } from '../../notifications.ts';
 import { debug } from '@/core/core.js';
 import { onDestroy, onMount, tick } from 'svelte';

 // Local monitors store for this component
 let monitors = writable<Monitor[]>([]);
 let monitorInterval: Timer | undefined;
 let permissionInterval: Timer | undefined;
 let monitorOptions = writable<any[]>([]);
 let _notificationsEnabled = get(notificationsEnabled);
 let mounted = false;

 // Store all subscription unsubscribe functions
 const unsubscribers: Unsubscriber[] = [];

 // Helper to add subscriptions and track unsubscribers
 function addSubscription<T>(
  store: {
   subscribe: (callback: (value: T) => void) => Unsubscriber;
  },
  callback: (value: T) => void
 ): void {
  const unsubscribe = store.subscribe(callback);
  unsubscribers.push(unsubscribe);
 }

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

 function setupNotificationPermissionTimer() {
  permissionInterval = setInterval(() => {
   //log.debug('permissionInterval:', Notification.permission);
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

 onMount(() => {
  if (window.__TAURI__) {
   updateMonitors();
   monitorInterval = setInterval(updateMonitors, 1000);
  }

  log.debug('SettingsNotifications onMount');

  // Subscribe to monitors and keep unsubscribe function
  addSubscription(monitors, value => {
   monitorOptions.set(
    [
     //{ name: 'primary', label: 'primary' },
     { name: 'main_window_monitor', label: 'Main window monitor' },
    ].concat(value.map((m: any) => ({ name: m.name, label: m.name + '(' + m.size.width + 'x' + m.size.height + ')' })))
   );
  });

  addSubscription(notificationsSoundEnabled, v => {
   log.debug('notificationsSoundEnabled:', v);
   updateExampleNotification();
  });

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

  if (BROWSER) {
   setupNotificationPermissionTimer();
  }
 });

 onDestroy(async () => {
  // Clean up all store subscriptions
  unsubscribers.forEach(unsubscribe => unsubscribe());

  // Clear intervals
  if (monitorInterval) {
   clearInterval(monitorInterval);
  }
  if (permissionInterval) {
   clearInterval(permissionInterval);
  }

  for (const notification of get(exampleNotifications)) {
   await deleteNotification(notification);
  }
 });

 async function updateMonitors() {
  let mons = await availableMonitors();
  //log.debug('updateMonitors:', mons);
  monitors.set(mons);
 }
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
