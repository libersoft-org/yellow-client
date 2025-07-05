<script lang="ts">
	import { selectedNetwork, selectedAddress } from '../scripts/wallet.ts';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	let link: string | undefined = $state();
	let elLink: HTMLDivElement | undefined = $state();

	$effect(() => {
		if ($selectedNetwork && $selectedAddress) {
			if ($selectedNetwork.explorerURL) link = $selectedNetwork.explorerURL + '/address/' + $selectedAddress.address;
			else link = undefined;
		}
	});

	function copyLink(): void {
		if (!link) return;
		navigator.clipboard
			.writeText(link)
			.then(() => console.log('Address copied to clipboard'))
			.catch(err => console.error('Error while copying to clipboard', err));
		setInfo('Copied!');
		setTimeout(() => hideInfo(), 1000);
	}

	function openLink(): void {
		window.open(link, '_blank');
	}

	function setInfo(text: string): void {
		if (elLink) elLink.innerText = text;
	}

	function hideInfo(): void {
		if (elLink && link) elLink.innerText = link;
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
	{#if !link}
		<Alert type="error" message="The selected network has no block explorer" />
	{:else}
		<div class="history">
			<div class="bold">Address history:</div>
			<div class="url" bind:this={elLink}>{link}</div>
			<ButtonBar equalize align="center">
				<Button img="img/copy.svg" text="Copy link" onClick={copyLink} />
				<Button img="img/link.svg" text="Open link" onClick={openLink} />
			</ButtonBar>
		</div>
	{/if}
{/if}
