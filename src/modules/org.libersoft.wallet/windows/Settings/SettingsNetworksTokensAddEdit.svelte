<script lang="ts">
	import { getGuid } from '@/core/scripts/utils/utils.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import { addToken, editToken, type IToken } from '@/org.libersoft.wallet/scripts/network.ts';
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
		item?: IToken;
	}
	let { close, networkGuid, item }: Props = $props();
	let tokenGuid: string | undefined = $state();
	let tokenName: string | undefined = $state();
	let tokenIcon: string | undefined = $state();
	let tokenSymbol: string | undefined = $state();
	let tokenContractAddress: string | undefined = $state();
	let error: string | null | undefined = $state();
	let elTokenName: Input | undefined = $state();
	let elTokenSymbol: Input | undefined = $state();
	let elTokenContractAddress: Input | undefined = $state();
	let token: IToken = $derived.by(() => ({
		guid: item?.guid || getGuid(),
		item: {
			name: tokenName,
			symbol: tokenSymbol || '',
			contract_address: tokenContractAddress,
			iconURL: tokenIcon,
		},
	}));

	export function onOpen(): void {
		error = null;
		if (item?.item) {
			tokenGuid = item.guid;
			tokenName = item.item.name;
			tokenIcon = item.item.iconURL;
			tokenSymbol = item.item.symbol;
			tokenContractAddress = item.item.contract_address;
		}
		elTokenName?.focus();
	}

	function validateFields(): boolean {
		tokenName = tokenName?.trim();
		tokenIcon = tokenIcon?.trim();
		tokenSymbol = tokenSymbol?.trim();
		tokenContractAddress = tokenContractAddress?.trim();
		const validationConfig = [
			{ field: tokenName, element: elTokenName, required: 'Token name is required' },
			{ field: tokenSymbol, element: elTokenSymbol, required: 'Token symbol is required' },
			{ field: tokenContractAddress, element: elTokenContractAddress, required: 'Contract address is required' },
		];
		error = validateForm(validationConfig);
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
	<Label text="Name">
		<Input bind:value={tokenName} bind:this={elTokenName} />
	</Label>
	<Label text="Icon">
		<Input bind:value={tokenIcon} />
	</Label>
	<Label text="Symbol">
		<Input bind:value={tokenSymbol} bind:this={elTokenSymbol} />
	</Label>
	<Label text="Contract address">
		<Input bind:value={tokenContractAddress} bind:this={elTokenContractAddress} />
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
