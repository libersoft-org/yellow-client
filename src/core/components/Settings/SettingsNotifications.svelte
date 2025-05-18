<script lang="ts">
 import Table from '../Table/Table.svelte';
 import Tbody from '../Table/TableTbody.svelte';
 import TbodyTr from '../Table/TableTbodyTr.svelte';
 import Td from '../Table/TableTbodyTd.svelte';
 import Input from '../Input/Input.svelte';
 import Select from '../Select/Select.svelte';
 import Option from '../Select/SelectOption.svelte';
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
  <Tbody>
   <SettingsNotificationsBasic />
   {#if CUSTOM_NOTIFICATIONS}
    {#if $customNotificationsOn}
     <TbodyTr>
      <Td>
       <div class="bold">Animation:</div>
      </Td>
      <Td center={true}>
       <Select bind:value={$animationName}>
        <Option value="none" text="None" />
        <Option value="zoom" text="Zoom" />
        <Option value="opacity" text="Opacity" />
       </Select>
      </Td>
     </TbodyTr>
     <TbodyTr>
      <Td>
       <div class="bold">Animation duration:</div>
      </Td>
      <Td center={true}>
       <Input type="number" bind:value={$animationDuration} min={0} max={1000} step={10} />ms
      </Td>
     </TbodyTr>
     <TbodyTr>
      <Td>
       <div class="bold">Maximum number of lines in title:</div>
      </Td>
      <Td center={true}>
       <Input type="number" bind:value={$titleMaxLines} min={1} max={3} />
      </Td>
     </TbodyTr>
     <TbodyTr>
      <Td>
       <div class="bold">Maximum number of lines in description:</div>
      </Td>
      <Td center={true}>
       <Input type="number" bind:value={$bodyMaxLines} min={1} max={5} />
      </Td>
     </TbodyTr>
     <TbodyTr>
      <Td>
       <div class="bold">Background color:</div>
      </Td>
      <Td center={true}>
       <input type="color" bind:value={$bgColor} />
       {$bgColor}
      </Td>
     </TbodyTr>
     <TbodyTr>
      <Td>
       <div class="bold">Background color on mouse over:</div>
      </Td>
      <Td center={true}>
       <input type="color" bind:value={$bgColorHover} />
       {$bgColorHover}
      </Td>
     </TbodyTr>
     <TbodyTr>
      <Td>
       <div class="bold">Border color:</div>
      </Td>
      <Td center={true}>
       <input type="color" bind:value={$borderColor} />
       {$borderColor}
      </Td>
     </TbodyTr>
     <TbodyTr>
      <Td>
       <div class="bold">Title color:</div>
      </Td>
      <Td center={true}>
       <input type="color" bind:value={$titleColor} />
       {$titleColor}
      </Td>
     </TbodyTr>
     <TbodyTr>
      <Td>
       <div class="bold">Description color:</div>
      </Td>
      <Td center={true}>
       <input type="color" bind:value={$descColor} />
       {$descColor}
      </Td>
     </TbodyTr>
    {/if}
   {/if}
  </Tbody>
 </Table>
</div>
