<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { accounts, findAccount, sendAsync } from '@/core/core.ts';
	//let url = 'https://yellow-module1.netlify.app/'
	let url: string = 'http://localhost:5173/';
	let module_id: string = 'org.libersoft.messages2';
	let iframe: HTMLIFrameElement;

	onMount(() => {
		console.log('onMount');
		window.addEventListener('message', async event => {
			console.log('parent received message: ', event);
			//if (event.origin !== window.location.origin) return; // Validate origin
			//if (event.origin !== 'null') return;
			//if (event.source !== iframe) return;
			//iframe?.contentWindow.postMessage(await processUserModuleMessage(event.data), '*');
			event.source?.postMessage(await processUserModuleMessage(event.data), { targetOrigin: '*' });
			//iframe.contentWindow.location.origin);
		});
		// setInterval(() => {
		//  console.log('setInterval');
		//  iframe?.contentWindow.postMessage({ type: 'ping' }, '*');
		//  //window.postMessage({ type: 'ping' }, '*');
		// }, 500);
	});

	async function processUserModuleMessage(data: any) {
		console.log('processUserModuleMessage: ', data);
		if (!data) return;
		if (data.type === 'server_command') {
			return await serverCommand(data);
		} else if (data.type === 'list_accounts') {
			let res: any[] = [];
			for (let account of get(accounts)) {
				let acc = get(account);
				if (acc.available_modules && acc.available_modules[module_id]) res.push(acc);
			}
			return res;
		}
	}

	async function serverCommand(data: any) {
		console.log('serverCommand: ', data);
		let account = findAccount(data.account);
		if (!account) return { error: 'Account not found' };
		let acc = get(account);
		return await sendAsync(acc, null, module_id, data.command, data.params);
	}
</script>

<style>
	.parent {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.parent iframe {
		width: 100%;
		height: 100%;
		border: none;
	}
</style>

<!--<div>Iframe-isolated module test</div>-->
<!--<iframe sandbox="allow-scripts" src={url} title="content" width="600" height="400"></iframe>-->
<!--<iframe sandbox="allow-scripts" src="https://koo5.github.io/" title="content" width="600" height="400"></iframe>-->
<!--<iframe id="iframe1" src="iframe1.html" style="width: 45%; height: 200px;"></iframe>-->
<!--<iframe id="iframe2" src="iframe2.html" style="width: 45%; height: 200px;"></iframe>-->
<div class="parent">
	<iframe bind:this={iframe} sandbox="allow-scripts" src={url} title="content"></iframe>
</div>
