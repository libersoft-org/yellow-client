<script>
	import { accounts_config } from '@/core/core.ts';
	import Tabs from '@/core/components/Tabs/Tabs.svelte';
	import TabsItem from '@/core/components/Tabs/TabsItem.svelte';
	import AccountsExportJson from '@/core/modals/Accounts/AccountsExportJson.svelte';
	import AccountsExportQR from '@/core/modals/Accounts/AccountsExportQR.svelte';
	let activeTab = $state('json');
	let jsonEditorContents = $state(JSON.stringify($accounts_config, null, 2));

	$effect(() => {
		console.log('JSON Editor contents updated:', jsonEditorContents);
	});
</script>

<style>
	.export {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>

<div class="export">
	<Tabs>
		<TabsItem label="JSON" active={activeTab === 'json'} onClick={() => (activeTab = 'json')} />
		<TabsItem label="QR Code" active={activeTab === 'qr'} onClick={() => (activeTab = 'qr')} />
	</Tabs>
	{#if activeTab === 'json'}
		<AccountsExportJson bind:code={jsonEditorContents} />
	{:else if activeTab === 'qr'}
		<AccountsExportQR />
	{/if}
</div>
