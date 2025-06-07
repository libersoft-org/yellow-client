<script lang="ts">
	import { wallets, walletAddresses, selectAddress } from '../wallet.ts';
	import { module } from '../module.js';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Accordion from '@/core/components/Accordion/Accordion.svelte';
	import InputButton from '@/core/components/Input/InputButton.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ModalWallets from './Settings/SettingsWallets.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	interface Props {
		close?: () => void;
	}
	let { close }: Props = $props();
	let showModalWallets = $state(false);
	let activeIndex = $state(null);
	let filter = $state('');

	function clickSelectAddress(wallet, address) {
		console.log('SETTING ADDRESS', wallet, address);
		selectAddress(wallet, address);
		if (close) close();
	}
</script>

<Button img="modules/{module.identifier}/img/wallet.svg" text="Manage wallet addresses" onClick={() => (showModalWallets = true)} />
<InputButton img="img/search.svg" placeholder="Search" bind:value={filter} onClick={() => {}} onKeydown={() => {}} minWidth="200px" maxWidth="400px" />
<Accordion items={$wallets.map(w => ({ name: w.name, id: w.address }))} {activeIndex}>
	{#snippet content(wallet)}
		<Table breakpoint="0">
			<Tbody>
				{#each walletAddresses(wallet) as address, index}
					<Clickable onClick={() => clickSelectAddress(wallet, address)}>
						<TbodyTr>
							<Td title="Index">{address.index}</Td>
							<Td title="Name">{address.name}</Td>
							<Td title="Address">{address.address}</Td>
						</TbodyTr>
					</Clickable>
				{/each}
			</Tbody>
		</Table>
	{/snippet}
</Accordion>
<Modal title="Manage wallets" body={ModalWallets} bind:show={showModalWallets} />
