<script>
 import { get } from 'svelte/store';
 import MenuItem from '../components/menu-item.svelte';
 import Table from '../components/table.svelte';
 import Tbody from '../components/table-tbody.svelte';
 import Tr from '../components/table-tbody-tr.svelte';
 import Td from '../components/table-tbody-td.svelte';
 import Switch from '../components/switch.svelte';
 import SettingsAppearance from '../components/settings-appearance.svelte';
 import SettingsNotifications from '../components/settings-notifications.svelte';
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
