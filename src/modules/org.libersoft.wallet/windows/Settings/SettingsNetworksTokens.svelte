<script lang="ts">
	import { getContext, tick } from 'svelte';
	import { networks, type INetwork, type IToken, addToken, editToken, findNetworkByGuid } from '@/org.libersoft.wallet/scripts/network.ts';
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
	import Window from '@/core/components/Window/Window.svelte';
	import WindowAddEdit from '@/org.libersoft.wallet/windows/Settings/SettingsNetworksTokensAddEdit.svelte';
	import DialogTokenDel from '@/org.libersoft.wallet/dialogs/NetworksTokensDel.svelte';
	interface Props {
		item: string;
	}
	let { item }: Props = $props();
	let network: INetwork | undefined = $derived(findNetworkByGuid(item));
	let tokenToDelete: IToken | undefined = $state();
	let elWindowAddEdit: Window | undefined = $state();
	let elDialogDel: DialogTokenDel | undefined = $state();
	let windowItem: IToken | null | undefined = $state();

	async function addTokenWindow(): Promise<void> {
		windowItem = null;
		await tick();
		elWindowAddEdit?.open();
	}

	function onAdd(token: IToken): void {
		if (network?.guid) {
			addToken(network.guid, token);
			elWindowAddEdit?.close();
		}
	}

	function editTokenWindow(item: IToken): void {
		windowItem = item;
		elWindowAddEdit?.open();
	}

	function onEdit(token: IToken): void {
		if (network?.guid) {
			editToken(network.guid, token);
			elWindowAddEdit?.close();
		}
	}

	async function delTokenWindow(item: IToken): Promise<void> {
		tokenToDelete = item;
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
	<div>
		<span class="bold">Network:</span>
		<span>{network?.name}</span>
	</div>
	<ButtonBar>
		<Button img="modules/{module.identifier}/img/token-add.svg" text="Add token" onClick={addTokenWindow} />
	</ButtonBar>
	{#if network?.tokens}
		{#each network.tokens as t, i}
			<Table>
				<Thead>
					<TheadTr>
						<Th padding="0 10px">
							<div class="title">
								{#if t.icon}
									<Icon img={t.icon} alt={t.name} size="20px" padding="0px" />
								{/if}
								<div class="name">{t.name}</div>
							</div>
						</Th>
						<Th padding="0 10px">
							<ActionItems align="right">
								<Icon img="img/edit.svg" alt="Edit token" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => editTokenWindow(t)} />
								<Icon img="img/del.svg" alt="Delete token" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => delTokenWindow(t)} />
							</ActionItems>
						</Th>
					</TheadTr>
				</Thead>
				<Tbody>
					<TbodyTr>
						<Td bold>Icon:</Td>
						<Td expand>
							{#if t.icon}
								{t.icon}
							{:else}
								<span>No icon</span>
							{/if}
						</Td>
					</TbodyTr>
					<TbodyTr>
						<Td bold>Symbol:</Td>
						<Td expand>{t.symbol}</Td>
					</TbodyTr>
					<TbodyTr>
						<Td bold>Token contract address:</Td>
						<Td expand>{t.contract_address}</Td>
					</TbodyTr>
				</Tbody>
			</Table>
		{/each}
	{/if}
</div>
<Window title={windowItem ? 'Edit token' : 'Add token'} body={WindowAddEdit} params={{ item: windowItem, onAdd, onEdit }} bind:this={elWindowAddEdit} />
{#if tokenToDelete && network?.guid}
	<DialogTokenDel networkGuid={network.guid} token={tokenToDelete} bind:this={elDialogDel} />
{/if}
