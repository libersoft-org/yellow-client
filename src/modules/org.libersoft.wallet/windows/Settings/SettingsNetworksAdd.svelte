<script lang="ts">
	import { getContext } from 'svelte';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import { default_networks, type INetwork } from '@/org.libersoft.wallet/scripts/network.ts';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import TableActionItems from '@/core/components/Table/TableActionItems.svelte';
	const setSettingsSection = getContext<Function>('setSettingsSection');

	function openRPCServers(network: INetwork) {
		setSettingsSection('networks-rpc-' + network.guid);
	}

	async function clickAddNetwork(net: INetwork | null = null) {
		if (net) await setSettingsSection('networks-add-sw', { network: net });
		else await setSettingsSection('networks-add-sw', { network: undefined });
	}
</script>

<style>
	.network {
		display: flex;
		align-items: center;
		padding: 0 10px;
		gap: 10px;
		height: 50px;
	}
</style>

<ButtonBar>
	<Button img="modules/{module.identifier}/img/network-add.svg" text="Add a custom network" onClick={clickAddNetwork} />
</ButtonBar>
<div class="bold">Default networks:</div>
<Table breakpoint="0">
	<Thead>
		<TheadTr>
			<Th>Network</Th>
			<Th align="center">Action</Th>
		</TheadTr>
	</Thead>
	<Tbody>
		{#each $default_networks as n, index}
			<TbodyTr>
				<Td padding="0" data-testid="wallet-settings-default-network-name@{n.name}">
					<div class="network">
						{#if n.currency?.iconURL}
							<Icon img={n.currency.iconURL} alt={n.name} padding="0px" />
						{/if}
						<div class="name">{n.name}</div>
					</div>
				</Td>
				<Td>
					<TableActionItems align="center">
						<Icon img="modules/{module.identifier}/img/network.svg" colorVariable="--primary-foreground" alt="RPC servers" size="20px" padding="5px" onClick={() => openRPCServers(n)} />
						<Icon img="img/add.svg" alt="Add to my networks" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => clickAddNetwork(n)} testId="wallet-settings-default-network-add@{n.name}" />
					</TableActionItems>
				</Td>
			</TbodyTr>
		{/each}
	</Tbody>
</Table>
