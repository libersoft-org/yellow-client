<script lang="ts">
	import { selectedNetworkID, networks } from '../wallet.ts';
	import { module } from '../module.ts';
	import Input from '@/core/components/Input/Input.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ModalNetworks from './Settings/SettingsNetworks.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	interface Props {
		close?: () => void;
	}
	let { close }: Props = $props();
	let elModalNetworks;
	let filter = $state('');

	function selectNetwork(id) {
		console.log('SETTING NETWORK', id);
		selectedNetworkID.set(id);
		if (close) close();
	}
</script>

<Button img="modules/{module.identifier}/img/network.svg" text="Manage networks" onClick={() => elModalNetworks?.open()} />
<Input icon={{ img: 'img/search.svg', alt: 'Search' }} bind:value={filter} />
<Table breakpoint="0">
	<Tbody>
		{#each $networks as n}
			<TbodyTr>
				<Td>
					<Clickable onClick={() => selectNetwork(n.guid)}>
						<Icon img={n.currency.iconURL} />{n.name}
					</Clickable>
				</Td>
			</TbodyTr>
		{/each}
	</Tbody>
</Table>
<Modal title="Manage networks" body={ModalNetworks} bind:this={elModalNetworks} />
