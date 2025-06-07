<script lang="ts">
	import Tabs from '@/core/components/Tabs/Tabs.svelte';
	import TabsItem from '@/core/components/Tabs/TabsItem.svelte';
	import AccountsImportJson from '@/core/modals/Accounts/AccountsImportJson.svelte';
	import AccountsImportQR from '@/core/modals/Accounts/AccountsImportQR.svelte';
	interface Props {
		close: () => void;
	}
	let { close }: Props = $props();
	let activeTab = $state('json');
</script>

<Tabs>
	<TabsItem img="img/import.svg" label="JSON" active={activeTab === 'json'} onClick={() => (activeTab = 'json')} />
	<TabsItem img="img/photo.svg" label="QR Code" active={activeTab === 'qr'} onClick={() => (activeTab = 'qr')} />
</Tabs>

{#if activeTab === 'json'}
	<AccountsImportJson {close} />
{:else if activeTab === 'qr'}
	<AccountsImportQR {close} />
{/if}
