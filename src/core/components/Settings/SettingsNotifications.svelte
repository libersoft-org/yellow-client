<script lang="ts">
 import type { Unsubscriber } from 'svelte/store';
 import { log, CUSTOM_NOTIFICATIONS, BROWSER } from '../../tauri.ts';
 import { customNotificationsOn, animationDuration, animationName, titleMaxLines, bodyMaxLines, bgColor, bgColorHover, borderColor, titleColor, descColor, notificationsSoundEnabled } from '../../notifications_settings.ts';
 import { skipFirst } from '$lib/skipfirst_store.ts';
 import { updateExampleNotification } from '@/core/notifications.ts';
 import Input from '@/core/components/Input/Input.svelte';
 import Select from '@/core/components/Select/Select.svelte';
 import Option from '@/core/components/Select/SelectOption.svelte';
 import SettingsNotificationsBasic from '@/core/components/Settings/SettingsNotificationsBasic.svelte';
 import SettingsNotificationsAlert from '@/core/components/Settings/SettingsNotificationsAlert.svelte';

 import Table from '@/core/components/ResponsiveTable/Table.svelte';
 import THead from '@/core/components/ResponsiveTable/THead.svelte';
 import THeadTr from '@/core/components/ResponsiveTable/THeadTr.svelte';
 import THeadTh from '@/core/components/ResponsiveTable/THeadTh.svelte';
 import TBody from '@/core/components/ResponsiveTable/TBody.svelte';
 import TBodyTr from '@/core/components/ResponsiveTable/TBodyTr.svelte';
 import TBodyTd from '@/core/components/ResponsiveTable/TBodyTd.svelte';

 // Store all subscription unsubscribe functions
 const unsubscribers: Unsubscriber[] = [];

 // Helper to add subscriptions and track unsubscribers
 function addSubscription<T>(store: { subscribe: (callback: (value: T) => void) => Unsubscriber }, callback: (value: T) => void): void {
  unsubscribers.push(store.subscribe(callback));
 }

 $effect(() => {
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
 <SettingsNotificationsBasic />

 {#if CUSTOM_NOTIFICATIONS}
  {#if $customNotificationsOn}
   <Table>
    <THead>
     <THeadTr>
      <THeadTh>Animation:</THeadTh>
      <THeadTh>Animation duration:</THeadTh>
      <THeadTh>Maximum number of lines in title:</THeadTh>
      <THeadTh>Maximum number of lines in description:</THeadTh>
      <THeadTh>Background color:</THeadTh>
      <THeadTh>Background color on mouse over:</THeadTh>
      <THeadTh>Border color:</THeadTh>
      <THeadTh>Title color:</THeadTh>
      <THeadTh>Description color:</THeadTh>
     </THeadTr>
    </THead>
    <TBody>
     <TBodyTr>
      <TBodyTd title="Animation">
       <Select bind:value={$animationName}>
        <Option value="none" text="None" />
        <Option value="zoom" text="Zoom" />
        <Option value="opacity" text="Opacity" />
       </Select>
      </TBodyTd>
      <TBodyTd title="Animation duration">
       <div>
        <Input type="number" bind:value={$animationDuration} min={0} max={1000} step={10} />ms
       </div>
      </TBodyTd>
      <TBodyTd title="Maximum number of lines in title">
       <Input type="number" bind:value={$titleMaxLines} min={1} max={3} />
      </TBodyTd>
      <TBodyTd title="Maximum number of lines in description">
       <Input type="number" bind:value={$bodyMaxLines} min={1} max={5} />
      </TBodyTd>
      <TBodyTd title="Background color">
       <div>
        <input type="color" bind:value={$bgColor} />
        {$bgColor}
       </div>
      </TBodyTd>
      <TBodyTd title="Background color on mouse over">
       <div>
        <input type="color" bind:value={$bgColorHover} />
        {$bgColorHover}
       </div>
      </TBodyTd>
      <TBodyTd title="Border color">
       <div>
        <input type="color" bind:value={$borderColor} />
        {$borderColor}
       </div>
      </TBodyTd>
      <TBodyTd title="Title color">
       <div>
        <input type="color" bind:value={$titleColor} />
        {$titleColor}
       </div>
      </TBodyTd>
      <TBodyTd title="Description color">
       <div>
        <input type="color" bind:value={$descColor} />
        {$descColor}
       </div>
      </TBodyTd>
     </TBodyTr>
    </TBody>
   </Table>
  {/if}
 {/if}
</div>
