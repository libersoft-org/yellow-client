<script lang="ts">
	import { getGuid } from '@/core/scripts/utils/utils.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import { addToken, editToken, type IToken } from '@/org.libersoft.wallet/scripts/network.ts';
	import Label from '@/core/components/Label/Label.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Form from '@/core/components/Form/Form.svelte';
	interface Props {
		close: () => void;
		networkGuid: string;
		item?: IToken;
	}
	let { close, networkGuid, item }: Props = $props();
	let token_guid = $state('');
	let tokenName = $state('');
	let tokenIcon = $state('');
	let tokenSymbol = $state('');
	let tokenContractAddress = $state('');
	let elTokenName: Input;
	let elTokenSymbol: Input;
	let elTokenContractAddress: Input;

	export function onOpen(): void {
		let token = item;
		if (token) {
			token_guid = token.guid;
			tokenName = token.name;
			tokenIcon = token.icon;
			tokenSymbol = token.symbol;
			tokenContractAddress = token.contract_address;
		}
		elTokenName?.focus();
	}

	function token() {
		return {
			guid: item ? item.guid : getGuid(),
			name: tokenName,
			icon: tokenIcon,
			symbol: tokenSymbol,
			contract_address: tokenContractAddress,
		};
	}

	function clickAdd() {
		addToken(networkGuid, token());
		close();
	}

	function clickEdit() {
		editToken(networkGuid, token());
		close();
	}
</script>

<Form onSubmit={() => (item ? clickEdit() : clickAdd())}>
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
</Form>
<ButtonBar expand>
	{#if item}
		<Button img="img/save.svg" text="Save" onClick={clickEdit} />
	{:else}
		<Button img="modules/{module.identifier}/img/token-add.svg" text="Add token" onClick={clickAdd} />
	{/if}
	<Button img="img/cancel.svg" text="Cancel" onClick={close} />
</ButtonBar>
