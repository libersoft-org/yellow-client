<script>
 import MenuItem from '../components/Menu/MenuItem.svelte';
 import SettingsAppearance from '../components/Settings/SettingsAppearance.svelte';
 import SettingsNotifications from '../components/Settings/SettingsNotifications.svelte';
 import SettingsGeneral from '../components/Settings/SettingsGeneral.svelte';
 import { TAURI } from '@/core/tauri.ts';
 let activeTab = TAURI ? 'general' : 'appearance';
 let menuItemProps = {
  bgColor: '#fff',
  textColor: '#000',
  hoverColor: '#eee',
  borderTop: '1px solid #888',
  borderBottom: '1px solid #888',
  borderLeft: '1px solid #888',
  borderRight: '1px solid #888',
  borderRadius: '10px',
 };
 let menuItems = (
  TAURI
   ? [
      {
       title: 'General',
       img: 'img/settings.svg',
       onClick: () => setItem('general'),
      },
     ]
   : []
 ).concat([
  {
   title: 'Appearance',
   img: 'img/appearance.svg',
   onClick: () => setItem('appearance'),
  },
  {
   title: 'Notifications',
   img: 'img/notification.svg',
   onClick: () => setItem('notifications'),
  },
 ]);

 function setItem(name) {
  activeTab = name;
 }
</script>

<style>
 .settings-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
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
 {#each menuItems as item}
  <MenuItem img={item.img} title={item.title} colorVariable="--icon-black" bgColor={menuItemProps.bgColor} textColor={menuItemProps.textColor} hoverColor={menuItemProps.hoverColor} borderTop={menuItemProps.borderTop} borderBottom={menuItemProps.borderBottom} borderLeft={menuItemProps.borderLeft} borderRight={menuItemProps.borderRight} borderRadius={menuItemProps.borderRadius} onClick={item.onClick} />
 {/each}
 <div class="tab-content">
  {#if activeTab === 'general'}
   <SettingsGeneral />
  {:else if activeTab === 'appearance'}
   <SettingsAppearance />
  {:else if activeTab === 'notifications'}
   <SettingsNotifications />
  {/if}
 </div>
</div>
