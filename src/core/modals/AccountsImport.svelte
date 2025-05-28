<script lang="ts">
 import Tabs from '../components/Tabs/Tabs.svelte';
 import TabsItem from '../components/Tabs/TabsItem.svelte';
 import AccountsImportJson from './AccountsImportJson.svelte';
 import AccountsImportQR from './AccountsImportQR.svelte';

 type Props = {
  close: () => void;
 };

 let { close }: Props = $props();

 let activeTab = $state('json');
</script>

<Tabs>
 <TabsItem label="JSON" active={activeTab === 'json'} onClick={() => (activeTab = 'json')} />
 <TabsItem label="QR Code" active={activeTab === 'qr'} onClick={() => (activeTab = 'qr')} />
</Tabs>

{#if activeTab === 'json'}
 <AccountsImportJson {close} />
{:else if activeTab === 'qr'}
 <AccountsImportQR {close} />
{/if}
