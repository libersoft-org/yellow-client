<script>
	import { selectedNetwork, selectedAddress } from '../wallet.ts';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	let info = '';
	let link = '';
	let elLink;

	$: link = $selectedNetwork.explorerURL + '/address/' + $selectedAddress.address;

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
		padding: 10px;
		border-radius: 10px;
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
	}
</style>

<div class="history">
	{#if $selectedNetwork && $selectedAddress}
		<div class="bold">Address history:</div>
		<div class="url" bind:this={elLink}>{link}</div>
		<ButtonBar>
			<Button text="Copy link" onClick={copyLink} />
			<Button text="Open link" onClick={openLink} />
		</ButtonBar>
	{:else}
		<div>No network or wallet selected</div>
	{/if}
</div>
