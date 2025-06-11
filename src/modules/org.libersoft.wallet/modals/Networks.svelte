<script lang="ts">
	import { selectedNetworkID, networks } from '../wallet.ts';
	import { module } from '../module.js';
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
	let showModalNetworks = $state(false);
	let filter = $state('');

	function selectNetwork(id) {
		console.log('SETTING NETWORK', id);
		selectedNetworkID.set(id);
		if (close) close();
	}
</script>

<Button img="modules/{module.identifier}/img/network.svg" text="Manage networks" onClick={() => (showModalNetworks = true)} />
<Input icon={{ img: 'img/search.svg', alt: 'Search' }} bind:value={filter} />
<Table breakpoint="0">
	<Tbody>
		{#each $networks as n}
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
<Modal title="Manage networks" body={ModalNetworks} bind:show={showModalNetworks} />
