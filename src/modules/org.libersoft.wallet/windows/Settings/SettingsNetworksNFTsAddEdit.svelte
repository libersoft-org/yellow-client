<script lang="ts">
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import { addNFT, editNFT, type INftConf } from 'libersoft-crypto/network';
	import { validateForm } from '@/core/scripts/utils/form.ts';
	import Label from '@/core/components/Label/Label.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Form from '@/core/components/Form/Form.svelte';
	interface Props {
		close: () => void;
		networkGuid: string;
		item?: INftConf;
	}
	let { close, networkGuid, item }: Props = $props();
	let nftContractAddress: string | undefined = $state();
	let nftTokenId: string | undefined = $state();
	let error: string | null | undefined = $state();

	let elNftContractAddress: Input | undefined = $state();
	let elNftTokenId: Input | undefined = $state();

	/* todo: start using:
	import { nftsForDisplay } from 'libersoft-crypto/nfts';
	...
	*/

	let nftData: { contract_address: string; token_id: string } = $derived.by(() => ({
		contract_address: nftContractAddress || '',
		token_id: nftTokenId || '', // Required for ERC1155 contracts

		// hmmm, we could cache this:
		name: undefined, // Will be loaded from blockchain
		description: undefined, // Will be loaded from blockchain
		image: undefined, // Will be loaded from blockchain
		external_url: undefined, // Will be loaded from blockchain
	}));

	$inspect(nftData);

	export function onOpen(): void {
		error = null;
		if (item) {
			nftContractAddress = item.contract_address;
			nftTokenId = item.token_id;
		}
		elNftContractAddress?.focus();
	}

	function validateFields(): boolean {
		nftContractAddress = nftContractAddress?.trim();
		nftTokenId = nftTokenId?.trim();

		const validationConfig = [{ field: nftContractAddress, element: elNftContractAddress, required: 'Contract address is required' }];
		error = validateForm(validationConfig);
		return !error;
	}

	function clickAdd() {
		if (!validateFields()) return;
		addNFT(networkGuid, nftData.contract_address, nftData.token_id);
		close();
	}

	function clickEdit() {
		if (!validateFields() || !item?.guid) return;
		editNFT(networkGuid, item.guid, nftData.contract_address, nftData.token_id);
		close();
	}

	function handleSubmit(): void {
		error = null;
		if (item) clickEdit();
		else clickAdd();
	}
</script>

<Form onSubmit={handleSubmit}>
	<Label text="NFT Contract Address *">
		<Input bind:value={nftContractAddress} bind:this={elNftContractAddress} placeholder="0x..." />
	</Label>
	<Label text="Token ID (Optional)">
		<Input bind:value={nftTokenId} bind:this={elNftTokenId} placeholder="Leave empty for ERC721, required for specific ERC1155 tokens" />
	</Label>
	<div style="font-size: 14px; color: var(--tertiary-foreground); margin-top: 5px;">
		<strong>ERC721:</strong> Leave Token ID empty to load all NFTs from the contract.<br />
		<strong>ERC1155:</strong> Specify a Token ID to load a specific token type from the contract.
	</div>
	{#if error}
		<Alert type="error" message={error} />
	{/if}
</Form>
<ButtonBar expand>
	{#if item}
		<Button img="img/save.svg" text="Save" onClick={clickEdit} />
	{:else}
		<Button img="modules/{module.identifier}/img/nft.svg" text="Add NFT Contract" onClick={clickAdd} />
	{/if}
	<Button img="img/cancel.svg" text="Cancel" onClick={close} />
</ButtonBar>
