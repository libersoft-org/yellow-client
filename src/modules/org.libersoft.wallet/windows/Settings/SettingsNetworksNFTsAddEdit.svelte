<script lang="ts">
	import { getGuid } from '@/core/scripts/utils/utils.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import { addNFT, editNFT, type INFT, type INFTData } from '@/org.libersoft.wallet/scripts/network.ts';
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
		item?: INFT;
	}
	let { close, networkGuid, item }: Props = $props();
	let nftContractAddress: string | undefined = $state();
	let error: string | null | undefined = $state();
	let elNftContractAddress: Input | undefined = $state();

	let nftData: INFTData = $derived.by(() => ({
		contract_address: nftContractAddress || '',
		token_id: '', // Not needed, we'll load all NFTs from the contract
		name: undefined, // Will be loaded from blockchain
		description: undefined, // Will be loaded from blockchain
		image: undefined, // Will be loaded from blockchain
		external_url: undefined, // Will be loaded from blockchain
	}));

	export function onOpen(): void {
		error = null;
		if (item?.item) {
			nftContractAddress = item.item.contract_address;
		}
		elNftContractAddress?.focus();
	}

	function validateFields(): boolean {
		nftContractAddress = nftContractAddress?.trim();

		const validationConfig = [{ field: nftContractAddress, element: elNftContractAddress, required: 'Contract address is required' }];
		error = validateForm(validationConfig);
		return !error;
	}

	function clickAdd() {
		if (!validateFields()) return;
		addNFT(networkGuid, nftData);
		close();
	}

	function clickEdit() {
		if (!validateFields() || !item?.guid) return;
		editNFT(networkGuid, item.guid, nftData);
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
	<div style="font-size: 14px; color: var(--tertiary-foreground); margin-top: 5px;">All NFT information (name, description, image, etc.) will be automatically loaded from the blockchain.</div>
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
