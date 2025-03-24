<script>
 import { get } from 'svelte/store';
 import Table from '../components/table.svelte';
 import Tbody from '../components/table-tbody.svelte';
 import Tr from '../components/table-tbody-tr.svelte';
 import Td from '../components/table-tbody-td.svelte';
 import Switch from '../components/switch.svelte';
 import Tabs from '../components/tabs.svelte';
 import TabsItem from '../components/tabs-item.svelte';
 import SettingsAppearance from '../components/settings-appearance.svelte';
 import SettingsNotifications from '../components/settings-notifications.svelte';
 import { tick } from 'svelte';

 // Tab selection
 let activeTab = 'appearance';
</script>

<style>
 .settings-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
 }

 .tab-content {
  margin-top: 10px;
 }

 .alert {
  color: #f44;
  padding: 10px;
  background-color: rgba(255, 0, 0, 0.1);
  border-radius: 5px;
 }
</style>

<div class="settings-container">
 <Tabs>
  <TabsItem label="Appearance" active={activeTab === 'appearance'} onClick={() => (activeTab = 'appearance')} />
  <TabsItem label="Notifications" active={activeTab === 'notifications'} onClick={() => (activeTab = 'notifications')} />
 </Tabs>

 <div class="tab-content">
  {#if activeTab === 'appearance'}
   <SettingsAppearance />
  {:else if activeTab === 'notifications'}
   <div>
    <Table>
     <Tbody></Tbody>
    </Table>

    <SettingsNotifications />
   </div>
  {/if}
 </div>
</div>
