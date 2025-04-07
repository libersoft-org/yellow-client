<script>
 import { get } from 'svelte/store';
 import MenuItem from '../Menu/MenuItem.svelte';
 import Table from '../Table/Table.svelte';
 import TableTBody from '../Table/TableTBody.svelte';
 import TableTBodyTr from '../Table/TableTBodyTr.svelte';
 import TableTBodyTd from '../Table/TableTBodyTd.svelte';
 import Switch from '../Switch/Switch.svelte';
 import SettingsAppearance from './SettingsAppearance.svelte';
 import SettingsNotifications from './SettingsNotifications.svelte';
 import { tick } from 'svelte';
 let activeTab = 'appearance';
 let menuItemProps = {
  bgColor: '#fff',
  textColor: '#000',
  hoverColor: '#eee',
  borderColor: '#ddd',
  borderRadius: '10px',
 };
</script>

<style>
 .settings-container {
  display: flex;
  flex-direction: column;
 }

 .tab-content {
  margin-top: 10px;
 }

 /*.alert {*/
 /* color: #f44;*/
 /* padding: 10px;*/
 /* background-color: rgba(255, 0, 0, 0.1);*/
 /* border-radius: 5px;*/
 /*}*/
</style>

<div class="settings-container">
 <MenuItem img="img/appearance-black.svg" title="Appearance" bgColor={menuItemProps.bgColor} textColor={menuItemProps.textColor} hoverColor={menuItemProps.hoverColor} borderColor={menuItemProps.borderColor} borderRadius={menuItemProps.borderRadius} onClick={() => (activeTab = 'appearance')} />
 <MenuItem img="img/notification-black.svg" title="Notifications" bgColor={menuItemProps.bgColor} textColor={menuItemProps.textColor} hoverColor={menuItemProps.hoverColor} borderColor={menuItemProps.borderColor} borderRadius={menuItemProps.borderRadius} onClick={() => (activeTab = 'notifications')} />
 <div class="tab-content">
  {#if activeTab === 'appearance'}
   <SettingsAppearance />
  {:else if activeTab === 'notifications'}
   <SettingsNotifications />
  {/if}
 </div>
</div>
