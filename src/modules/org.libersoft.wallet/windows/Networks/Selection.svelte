<script lang="ts">
	import { selectedNetworkID, networks } from 'libersoft-crypto/network';
	import { settingsWindow } from '@/org.libersoft.wallet/scripts/ui';
	import { module } from '@/org.libersoft.wallet/scripts/module';
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
	let elFilter: Input | undefined = $state();

	export function onOpen(): void {
		elFilter?.focus();
	}

	function selectNetwork(id) {
		console.log('SETTING NETWORK', id);
		selectedNetworkID.set(id);
		console.log('SELECTED NETWORK', $selectedNetworkID);
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

	.network-selection {
		display: inline-grid;
		grid-auto-flow: column;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: 10px;
		max-width: 100%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.network-selection > span {
		min-width: 0;
	}
</style>

<Button img="modules/{module.identifier}/img/network.svg" text="Manage networks" onClick={() => manageNetworks()} data-testid="wallet-manage-networks-btn" />
<Input placeholder="Filter networks..." bind:value={filter} bind:this={elFilter} />
<Table breakpoint="0">
	<Tbody>
		{#each filteredNetworks as n}
			<TbodyTr data-network-name={n.name}>
				<Td padding="10px" class="ellipsis">
					<Clickable onClick={() => selectNetwork(n.guid)}>
						<span class="network-selection">
							<span class="td__icon">
								<Icon img={n.currency.iconURL} size="24px" padding="0" />
							</span>
							<span class="td__text">{n.name}</span>
						</span>
					</Clickable>
				</Td>
			</TbodyTr>
		{/each}
	</Tbody>
</Table>
