<script lang="ts">
	import { networks } from '../wallet.ts';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	interface Props {
		networkGuid: string;
		token: {
			guid: string;
			name: string;
			icon: string;
			symbol: string;
			contract_address: string;
		};
	}
	let { networkGuid, token }: Props = $props();
	let elDialog;
	let dialogData = {
		title: 'Delete token',
		body: question,
		icon: 'img/del.svg',
		buttons: [
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes },
			{ img: 'img/cross.svg', text: 'No', onClick: clickNo },
		],
	};

	function clickYes() {
		networks.update(nets => nets.map(n => (n.guid === networkGuid ? { ...n, tokens: (n.tokens ?? []).filter(t => t.guid !== token.guid) } : n)));
		elDialog?.close();
	}

	function clickNo() {
		elDialog?.close();
	}

	export function open() {
		elDialog?.open();
	}
</script>

{#snippet question()}
	<span>Would you like to delete this token: "</span>
	<span class="bold">{token.name} ({token.symbol})</span>
	<span>"?</span>
{/snippet}
<Dialog data={dialogData} bind:this={elDialog} />
