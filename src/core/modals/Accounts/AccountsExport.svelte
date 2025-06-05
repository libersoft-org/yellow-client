<script>
	import { accounts_config } from '@/core/core.ts';
	import { product } from '@/core/stores.ts';
	import Tabs from '@/core/components/Tabs/Tabs.svelte';
	import TabsItem from '@/core/components/Tabs/TabsItem.svelte';
	import AccountsExportJson from '@/core/modals/Accounts/AccountsExportJson.svelte';
	import AccountsExportQR from '@/core/modals/Accounts/AccountsExportQR.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	let activeTab = $state('json');
	let copyText = $state('Copy to clipboard');
	let timeoutId;

	function clickCopy() {
		navigator.clipboard.writeText(JSON.stringify($accounts_config, null, 2));
		copyText = 'Copied!';
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			copyText = 'Copy to clipboard';
		}, 2000);
	}

	function clickDownload() {
		let blob = new Blob([JSON.stringify($accounts_config, null, 2)], { type: 'application/json' });
		let url = URL.createObjectURL(blob);
		let a = document.createElement('a');
		a.href = url;
		a.download = product + '_accounts_' + new Date().toISOString().replace('T', ' ').replace('Z', '').replace(/\.\d+/, '') + '.json';
		a.click();
		setTimeout(() => {
			URL?.revokeObjectURL(url);
			a?.remove();
		}, 100000);
	}
</script>

<ButtonBar>
	<Button img="img/copy.svg" {copyText} text={copyText} onClick={clickCopy} />
	<Button img="img/download.svg" text="Download as file" onClick={clickDownload} />
</ButtonBar>
<Tabs>
	<TabsItem label="JSON" active={activeTab === 'json'} onClick={() => (activeTab = 'json')} />
	<TabsItem label="QR Code" active={activeTab === 'qr'} onClick={() => (activeTab = 'qr')} />
</Tabs>
{#if activeTab === 'json'}
	<AccountsExportJson />
{:else if activeTab === 'qr'}
	<AccountsExportQR />
{/if}
