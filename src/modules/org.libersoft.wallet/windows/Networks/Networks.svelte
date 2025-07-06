<script lang="ts">
	import { selectedNetworkID, networks, settingsWindow } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import Input from '@/core/components/Input/Input.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	interface Props {
		close?: () => void;
	}
	let { close }: Props = $props();
	let filter = $state('');
	let filteredNetworks = $derived($networks.filter(network => network.name.toLowerCase().includes(filter.toLowerCase())));

	function selectNetwork(id) {
		console.log('SETTING NETWORK', id);
		selectedNetworkID.set(id);
		if (close) close();
	}

	function manageNetworks() {
		$settingsWindow?.open('networks');
	}
</script>

<style>
	.item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px;
		min-height: 44px;
		box-sizing: border-box;
	}
</style>

<Button img="modules/{module.identifier}/img/network.svg" text="Manage networks" onClick={() => manageNetworks()} />
<Input bind:value={filter} placeholder="Filter networks..." />
<Table breakpoint="0">
	<Tbody>
		{#each filteredNetworks as n}
			<TbodyTr>
				<Td padding="0">
					<Clickable onClick={() => selectNetwork(n.guid)} expand>
						<div class="item">
							<Icon img={n.currency.iconURL} size="24px" padding="0" />
							<span>{n.name}</span>
						</div>
					</Clickable>
				</Td>
			</TbodyTr>
		{/each}
	</Tbody>
</Table>
