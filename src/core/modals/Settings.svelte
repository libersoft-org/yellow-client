<script lang="ts">
 import MenuItem from '../components/Menu/MenuItem.svelte';
 import SettingsAppearance from '../components/Settings/SettingsAppearance.svelte';
 import SettingsNotifications from '../components/Settings/SettingsNotifications.svelte';
 import SettingsGeneral from '../components/Settings/SettingsGeneral.svelte';
 import { TAURI } from '@/core/tauri.ts';
 import { fade } from 'svelte/transition';
 import Icon from '../components/Icon/Icon.svelte';

 type Props = {
  activeTab?: any;
 };

 let { activeTab = $bindable(TAURI ? 'general' : '') }: Props = $props();

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
  gap: 10px;
 }

 .tab-content {
  &:empty {
   display: none;
  }
 }

 .breadcrumbs {
  display: flex;
  padding: 6px 10px 8px;
  background: hsl(345, 6%, 13%);
  margin-bottom: 0px;
  border-radius: 10px;

  span,
  button {
   border: none;
   background: none;
   font-size: 14px;
   font-weight: bold;
   /* color: #ccc; */
   padding: 0;
   transition: color 0.3s ease;
   cursor: default;
   text-transform: capitalize;

   &:hover {
    color: white;
   }

   &:not(:first-child)::before {
    content: '>';
    margin: 0 5px;
    color: white;
   }

   &:last-child {
    color: white;
   }
  }

  button {
   cursor: pointer;
   display: flex;
   gap: 6px;
   color: white;
   filter: contrast(0.5);
   transition: filter 0.3s ease;

   &:hover {
    filter: contrast(1);
   }

   :global(.icon) {
    padding: 0 !important;
   }
  }
 }

 /*.alert {*/
 /* color: #f44;*/
 /* padding: 10px;*/
 /* background-color: rgba(255, 0, 0, 0.1);*/
 /* border-radius: 5px;*/
 /*}*/
</style>

<div class="settings-container">
 {#if activeTab !== ''}
  <div class="breadcrumbs" in:fade={{ duration: 400 }}>
   <button onclick={() => setItem('')}>
    <Icon img="img/home.svg" alt="Settings" colorVariable="--icon-white" size="16px" />
    Settings
   </button>
   <span>{activeTab}</span>
  </div>
 {/if}
 {#each menuItems as item}
  {#if activeTab === ''}
   <MenuItem img={item.img} title={item.title} colorVariable="--icon-black" bgColor={menuItemProps.bgColor} textColor={menuItemProps.textColor} hoverColor={menuItemProps.hoverColor} borderTop={menuItemProps.borderTop} borderBottom={menuItemProps.borderBottom} borderLeft={menuItemProps.borderLeft} borderRight={menuItemProps.borderRight} borderRadius={menuItemProps.borderRadius} onClick={() => setItem(item.title.toLowerCase())} />
  {/if}
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
