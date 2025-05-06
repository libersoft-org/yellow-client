<script lang="ts">
 import Table from '../Table/Table.svelte';
 import TableTBodyTr from '../Table/TableTBodyTr.svelte';
 import TableTBody from '../Table/TableTBody.svelte';
 import TableTBodyTd from '../Table/TableTBodyTd.svelte';
 import Input from '../Input/Input.svelte';
 import Select from '../Select/Select.svelte';
 import SelectOption from '../Select/SelectOption.svelte';
 import { customNotificationsOn, animationDuration, animationName, titleMaxLines, bodyMaxLines, bgColor, bgColorHover, borderColor, titleColor, descColor, notificationsSoundEnabled } from '../../notifications_settings.ts';
 import { log, CUSTOM_NOTIFICATIONS, BROWSER } from '../../tauri.ts';
 import type { Unsubscriber } from 'svelte/store';
 import SettingsNotificationsBasic from '@/core/components/Settings/SettingsNotificationsBasic.svelte';
 import SettingsNotificationsAlert from '@/core/components/Settings/SettingsNotificationsAlert.svelte';
 import { skipFirst } from '$lib/skipfirst_store.ts';
 import { onMount } from 'svelte';
 import { updateExampleNotification } from '@/core/notifications.ts';

 // Store all subscription unsubscribe functions
 const unsubscribers: Unsubscriber[] = [];

 // Helper to add subscriptions and track unsubscribers
 function addSubscription<T>(store: { subscribe: (callback: (value: T) => void) => Unsubscriber }, callback: (value: T) => void): void {
  unsubscribers.push(store.subscribe(callback));
 }

 onMount(() => {
  for (let store of [animationName, animationDuration, titleMaxLines, bodyMaxLines, bgColor, bgColorHover, borderColor, titleColor, descColor]) {
   addSubscription(skipFirst(store as any), value => {
    log.debug(`Store ${store} updated:`, value);
    updateExampleNotification();
   });
  }
 });
</script>

<style>
 .settings-notifications {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }
</style>

<div class="settings-notifications">
 <SettingsNotificationsAlert />
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
       <div class="bold">Animation duration:</div>
      </TableTBodyTd>
      <TableTBodyTd center={true}>
       <Input type="number" bind:value={$animationDuration} min={0} max={1000} step={10} />ms
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
</div>
