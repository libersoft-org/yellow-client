<script lang="ts">
	import { wallets, selectAddress, walletsModal, settingsModal } from '../../wallet.ts';
	import { module } from '../../module.ts';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Accordion from '@/core/components/Accordion/Accordion.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ModalWallets from '../Settings/SettingsWallets.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';

	interface Props {
		close?: () => void;
	}
	let { close }: Props = $props();
	let elModalWallets: Modal | undefined;
	let filter: string | undefined = $state();

	// Debug information
	//console.log('SectionWallets - $wallets:', $wallets);
	//console.log('SectionWallets - wallets length:', $wallets.length);

	function clickManageWallets() {
		$settingsModal.setSettingsSection('wallets');
		$settingsModal.open();
	}

	async function clickSelectWallet(wallet) {
		console.log('SELECTING WALLET', wallet);
		await $walletsModal.setSettingsSection('wallets-' + wallet.address);
	}
</script>

<style>
	.wallet {
		padding: 10px;
	}
</style>

<Button img="modules/{module.identifier}/img/wallet.svg" text="Manage wallets" onClick={clickManageWallets} />
<Input icon={{ img: 'img/search.svg', alt: 'Search' }} bind:value={filter} />

{#if $wallets.length > 0}
	<Table breakpoint="0">
		<Thead>
			<TheadTr>
				<Th>Wallet name</Th>
			</TheadTr>
		</Thead>
		<Tbody>
			{#each $wallets as wallet, index}
				<TbodyTr>
					<Td padding="0">
						<Clickable onClick={async () => await clickSelectWallet(wallet)}>
							<div class="wallet">{wallet.name}</div>
						</Clickable>
					</Td>
				</TbodyTr>
			{/each}
		</Tbody>
	</Table>
{/if}
<!--
<Accordion items={$wallets}>
	{#snippet content(wallet)}
		<Table breakpoint="0">
			<Tbody>
				{#each wallet.addresses as address}
					<Clickable onClick={() => clickSelectAddress(wallet, address)}>
						<TbodyTr>
							<Td>{address.index}</Td>
							<Td>{address.name}</Td>
							<Td>{address.address}</Td>
						</TbodyTr>
					</Clickable>
				{/each}
			</Tbody>
		</Table>
	{/snippet}
</Accordion>
-->

<Modal title="Manage wallets" body={ModalWallets} bind:this={elModalWallets} />
