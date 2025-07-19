<script lang="ts">
	import { getContext, tick } from 'svelte';
	import { type INetwork, type IToken, findNetworkByGuid } from '@/org.libersoft.wallet/scripts/network.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import ActionItems from '@/core/components/Table/TableActionItems.svelte';
	import DialogTokenDel from '@/org.libersoft.wallet/dialogs/NetworksTokensDel.svelte';
	interface Props {
		item: string;
	}
	let { item }: Props = $props();
	let network: INetwork | undefined = $derived(findNetworkByGuid(item));
	let tokenToDelete: IToken | undefined = $state();
	let elDialogDel: DialogTokenDel | undefined = $state();
	const setSettingsSection = getContext<Function>('setSettingsSection');

	function clickTokenAdd(): void {
		setSettingsSection('networks-tokens-add-' + item);
	}

	function clickTokenEdit(token: IToken): void {
		setSettingsSection('networks-tokens-edit-' + item + '-' + token.guid);
	}

	async function delTokenDialog(token: IToken): Promise<void> {
		tokenToDelete = token;
		await tick();
		elDialogDel?.open();
	}
</script>

<style>
	.token-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.info {
		display: flex;
		gap: 5px;
	}

	.title {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.title .name {
		padding: 10px 0;
	}
</style>

<div class="token-list">
	<div class="info">
		<div class="bold">Network:</div>
		<div>{network?.name}</div>
	</div>
	<ButtonBar>
		<Button img="modules/{module.identifier}/img/token-add.svg" text="Add token" onClick={clickTokenAdd} />
	</ButtonBar>
	{#if network?.tokens}
		{#each network.tokens as t, i}
			<Table>
				<Thead>
					<TheadTr>
						<Th padding="0 10px">
							<div class="title">
								{#if t.item.iconURL}
									<Icon img={t.item.iconURL} alt={t.item.name} size="20px" padding="0px" />
								{/if}
								<div class="name">{t.item.name}</div>
							</div>
						</Th>
						<Th padding="0 10px">
							<ActionItems align="right">
								<Icon img="img/edit.svg" alt="Edit token" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => clickTokenEdit(t)} />
								<Icon img="img/del.svg" alt="Delete token" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => delTokenDialog(t)} />
							</ActionItems>
						</Th>
					</TheadTr>
				</Thead>
				<Tbody>
					<TbodyTr>
						<Td bold>Icon:</Td>
						<Td expand>
							{#if t.item.iconURL}
								{t.item.iconURL}
							{:else}
								<span>No icon</span>
							{/if}
						</Td>
					</TbodyTr>
					<TbodyTr>
						<Td bold>Symbol:</Td>
						<Td expand>{t.item.symbol}</Td>
					</TbodyTr>
					<TbodyTr>
						<Td bold>Token contract address:</Td>
						<Td expand>{t.item.contract_address}</Td>
					</TbodyTr>
				</Tbody>
			</Table>
		{/each}
	{/if}
</div>
{#if tokenToDelete && network?.guid}
	<DialogTokenDel networkGuid={network.guid} token={tokenToDelete} bind:this={elDialogDel} />
{/if}
