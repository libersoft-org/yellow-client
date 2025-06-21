<script>
	import { selectedNetwork, selectedAddress } from '../wallet.ts';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	let link = '';
	let elLink;

	$: if ($selectedNetwork && $selectedAddress) {
		link = `${$selectedNetwork.explorerURL}/address/${$selectedAddress.address}`;
	}

	function copyLink() {
		navigator.clipboard
			.writeText(link)
			.then(() => console.log('Address copied to clipboard'))
			.catch(err => console.error('Error while copying to clipboard', err));
		setInfo('Copied!');
		setTimeout(() => hideInfo(), 1000);
	}

	function openLink() {
		window.open(link, '_blank');
	}

	function setInfo(text) {
		elLink.innerText = text;
	}

	function hideInfo() {
		elLink.innerText = link;
	}
</script>

<style>
	.history {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}

	.url {
		box-sizing: border-box;
		max-width: 100%;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		padding: 10px;
		border-radius: 10px;
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
	}
</style>

{#if $selectedNetwork && $selectedAddress}
	<div class="history">
		<div class="bold">Address history:</div>
		<div class="url" bind:this={elLink}>{link}</div>
		<ButtonBar equalize align="center">
			<Button img="img/copy.svg" text="Copy link" onClick={copyLink} />
			<Button img="img/link.svg" text="Open link" onClick={openLink} />
		</ButtonBar>
	</div>
{/if}
