<script lang="ts">
	import { getGuid } from '@/core/scripts/utils/utils.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import { addToken, editToken, type ITokenConf } from 'libersoft-crypto/network';
	import { validateForm } from '@/core/scripts/utils/form.ts';
	import { isValidContractAddress } from 'libersoft-crypto/address-validation';
	import Label from '@/core/components/Label/Label.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Form from '@/core/components/Form/Form.svelte';
	interface Props {
		close: () => void;
		networkGuid: string;
		item?: ITokenConf;
		contractAddress?: string;
	}
	let { close, networkGuid, item, contractAddress }: Props = $props();
	let tokenGuid: string | undefined = $state();
	let tokenName: string | undefined = $state();
	let tokenIcon: string | undefined = $state();
	let tokenContractAddress: string | undefined = $state();
	let error: string | null | undefined = $state();
	let elTokenContractAddress: Input | undefined = $state();
	let token: ITokenConf = $derived.by(() => ({
		guid: item?.guid || getGuid(),
		contract_address: tokenContractAddress || '',
		iconURL: tokenIcon,
	}));

	export function onOpen(): void {
		error = null;
		if (item) {
			tokenGuid = item.guid;
			tokenIcon = item.iconURL;
			tokenContractAddress = item.contract_address;
		} else if (contractAddress) {
			// Pre-fill contract address from QR code
			tokenContractAddress = contractAddress;
		}
		elTokenContractAddress?.focus();
	}

	function validateFields(): boolean {
		tokenIcon = tokenIcon?.trim();
		tokenContractAddress = tokenContractAddress?.trim();

		const validationConfig = [{ field: tokenContractAddress, element: elTokenContractAddress, required: 'Contract address is required' }];
		error = validateForm(validationConfig);

		if (!error && tokenContractAddress && !isValidContractAddress(tokenContractAddress)) {
			error = 'Invalid contract address format';
		}

		return !error;
	}

	function clickAdd() {
		if (!validateFields()) return;
		addToken(networkGuid, token);
		close();
	}

	function clickEdit() {
		if (!validateFields()) return;
		editToken(networkGuid, token);
		close();
	}

	function handleSubmit(): void {
		error = null;
		if (item) clickEdit();
		else clickAdd();
	}
</script>

<Form onSubmit={handleSubmit}>
	<Label text="Contract address">
		<Input bind:value={tokenContractAddress} bind:this={elTokenContractAddress} />
	</Label>
	<Label text="Icon URL">
		<Input bind:value={tokenIcon} />
	</Label>
	{#if error}
		<Alert type="error" message={error} />
	{/if}
</Form>
<ButtonBar expand>
	{#if item}
		<Button img="img/save.svg" text="Save" onClick={clickEdit} />
	{:else}
		<Button img="modules/{module.identifier}/img/token-add.svg" text="Add token" onClick={clickAdd} />
	{/if}
	<Button img="img/cancel.svg" text="Cancel" onClick={close} />
</ButtonBar>
