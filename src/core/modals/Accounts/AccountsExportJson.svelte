<script>
	import { accounts_config } from '@/core/core.ts';
	import Code from '@/core/components/Code/Code.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import { product } from '@/core/stores.ts';
	let { code = $bindable() } = $props();
	let copyText = $state('Copy to clipboard');
	let timeoutId;
	let activeTab = $state('json');
	let jsonEditorContents = $state(JSON.stringify($accounts_config, null, 2));

	function clickCopy() {
		navigator.clipboard.writeText(getJsonText());
		copyText = 'Copied!';
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			copyText = 'Copy to clipboard';
		}, 2000);
	}

	function clickDownload() {
		let blob = new Blob([getJsonText()], { type: 'application/json' });
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

	function getJsonText() {
		console.log('Exporting accounts config:', jsonEditorContents);
		return activeTab === 'json' ? jsonEditorContents : JSON.stringify($accounts_config, null, 2);
	}
</script>

<ButtonBar>
	<Button img="img/copy.svg" text={copyText} onClick={clickCopy} />
	<Button img="img/download.svg" text="Download as file" onClick={clickDownload} />
</ButtonBar>
<Code bind:code />
