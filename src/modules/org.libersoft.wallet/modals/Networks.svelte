<script lang="ts">
	import { selectedNetworkID, networks } from '../wallet.ts';
	import InputButton from '@/core/components/Input/InputButton.svelte';
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
	let showModalNetworks = false;
	let filter = '';

	function selectNetwork(id) {
		console.log('SETTING NETWORK', id);
		selectedNetworkID.set(id);
		if (close) close();
	}
</script>

<Button img="img/network.svg" text="Manage networks" onClick={() => (showModalNetworks = true)} />
<InputButton img="img/search.svg" placeholder="Search" bind:value={filter} />
<Table breakpoint="0">
	<Tbody>
		{#each $networks as n, index}
			<TbodyTr>
				<Clickable onClick={() => selectNetwork(n.guid)}>
					<Td>
						<Icon img={n.currency.iconURL} />{n.name}
					</Td>
				</Clickable>
			</TbodyTr>
		{/each}
	</Tbody>
</Table>
<Modal body={ModalNetworks} bind:show={showModalNetworks} />
