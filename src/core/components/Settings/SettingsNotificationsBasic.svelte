<script lang="ts">
 import Table from '../Table/Table.svelte';
 import Tbody from '../Table/TableTbody.svelte';
 import TbodyTr from '../Table/TableTbodyTr.svelte';
 import Td from '../Table/TableTbodyTd.svelte';
 import Input from '../Input/Input.svelte';
 import Switch from '../Switch/Switch.svelte';
 import Select from '../Select/Select.svelte';
 import Option from '../Select/SelectOption.svelte';
 import CornerSelector from '@/core/components/CornerSelector/CornerSelector.svelte';
 import { writable, get, type Unsubscriber } from 'svelte/store';
 import { selectedMonitorName, selectedNotificationsCorner, enableCustomNotifications, customNotificationsOn, animationDuration, animationName, titleMaxLines, bodyMaxLines, bgColor, bgColorHover, borderColor, titleColor, descColor, notificationsSoundEnabled } from '../../notifications_settings.ts';
 import { availableMonitors, type Monitor } from '@tauri-apps/api/window';
 import { notificationsSettingsAlert, notificationsEnabled, isRequestingNotificationsPermission } from '../../notifications_settings.ts';
 import { deleteExampleNotifications, setNotificationsEnabled } from '../../notifications.ts';
 import { log, CUSTOM_NOTIFICATIONS, BROWSER } from '../../tauri.ts';
 import { deleteNotification, updateExampleNotification, exampleNotifications } from '../../notifications.ts';
 import { debug } from '@/core/core.js';
 import { onDestroy, onMount, tick } from 'svelte';
 import { skipFirst } from '$lib/skipfirst_store.ts';

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
  const unsubscribe = skipFirst(store).subscribe(callback);
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

  if (BROWSER) {
   setupNotificationPermissionTimer();
  }

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

  addSubscription(selectedMonitorName, async v => {
   log.debug('selectedMonitor:', v);
   await deleteExampleNotifications();
   updateExampleNotification();
  });

  addSubscription(selectedNotificationsCorner, async v => {
   log.debug('selectedNotificationsCorner:', v);
   await deleteExampleNotifications();
   updateExampleNotification();
  });

  addSubscription(enableCustomNotifications, async v => {
   log.debug('enableCustomNotifications:', v);
   await deleteExampleNotifications();
   updateExampleNotification();
  });

  addSubscription(notificationsEnabled, value => {
   _notificationsEnabled = value;
   log.debug('notificationsEnabled:', value);
   updateExampleNotification();
  });
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

<Table>
 <TbodyTr>
  <Td>
   <div class="bold">Notifications:</div>
  </Td>
  <Td center={true}>
   <Switch bind:checked={_notificationsEnabled} />
  </Td>
 </TbodyTr>
 <TbodyTr>
  <Td>
   <div class="bold">Notification sound:</div>
  </Td>
  <Td center={true}>
   <Switch bind:checked={$notificationsSoundEnabled} />
  </Td>
 </TbodyTr>
 {#if CUSTOM_NOTIFICATIONS}
  <TbodyTr>
   <Td>
    <div class="bold">Custom notifications:</div>
   </Td>
   <Td center={true}>
    <Switch bind:checked={$enableCustomNotifications} />
   </Td>
  </TbodyTr>
  {#if $customNotificationsOn}
   <TbodyTr>
    <Td>
     <div class="bold">Monitor:</div>
    </Td>
    <Td center={true}>
     <Select bind:value={$selectedMonitorName}>
      {#each $monitorOptions as monitor}
       <Option value={monitor.name} selected={monitor.name === $selectedMonitorName} text={monitor.label} />
      {/each}
     </Select>
     {#if $debug}$selectedMonitorName:{$selectedMonitorName}{/if}
    </Td>
   </TbodyTr>
   <TbodyTr>
    <Td>
     <div class="bold">Corner:</div>
    </Td>
    <Td center={true}>
     <CornerSelector bind:value={$selectedNotificationsCorner} />
    </Td>
   </TbodyTr>
  {/if}
 {/if}
</Table>
