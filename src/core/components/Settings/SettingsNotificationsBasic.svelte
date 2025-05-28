<script lang="ts">
 import Switch from '../Switch/Switch.svelte';
 import Select from '../Select/Select.svelte';
 import Option from '../Select/SelectOption.svelte';
 import Table from '@/core/components/Table/Table.svelte';
 import Thead from '@/core/components/Table/TableThead.svelte';
 import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
 import TheadTh from '@/core/components/Table/TableTheadTh.svelte';
 import Tbody from '@/core/components/Table/TableTbody.svelte';
 import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
 import TbodyTd from '@/core/components/Table/TableTbodyTd.svelte';

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
    ].concat(
     value.map((m: any) => ({
      name: m.name,
      label: m.name + '(' + m.size.width + 'x' + m.size.height + ')',
     }))
    )
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
 <Thead>
  <TheadTr>
   <TheadTh>Notifications:</TheadTh>
   <TheadTh>Notification sound:</TheadTh>
   <TheadTh>Custom notifications:</TheadTh>
   <TheadTh>Monitor:</TheadTh>
   <TheadTh>Corner:</TheadTh>
  </TheadTr>
 </Thead>
 <Tbody>
  <TbodyTr>
   <TbodyTd title="Notifications">
    <Switch ariaLabel="Notifications" bind:checked={_notificationsEnabled} />
   </TbodyTd>
   <TbodyTd title="Notification sound">
    <Switch ariaLabel="Notification sound" bind:checked={$notificationsSoundEnabled} />
   </TbodyTd>
   {#if $customNotificationsOn}
    <TbodyTd title="Custom notifications">
     <Switch ariaLabel="Custom notifications" bind:checked={$enableCustomNotifications} />
    </TbodyTd>
    {#if $customNotificationsOn}
     <TbodyTd title="Monitor">
      <Select bind:value={$selectedMonitorName}>
       {#each $monitorOptions as monitor}
        <Option value={monitor.name} selected={monitor.name === $selectedMonitorName} text={monitor.label} />
       {/each}
      </Select>
      {#if $debug}$selectedMonitorName:{$selectedMonitorName}{/if}
     </TbodyTd>
     <TbodyTd title="Corner">
      <CornerSelector bind:value={$selectedNotificationsCorner} />
     </TbodyTd>
    {/if}
   {/if}
  </TbodyTr>
 </Tbody>
</Table>
