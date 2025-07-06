<script lang="ts">
	import { wallets, selectAddress, walletsModal, settingsModal } from '../../scripts/wallet.ts';
	import { module } from '../../scripts/module.ts';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Button from '@/core/components/Button/Button.svelte';
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

	let filteredWallets = $derived($wallets.filter(wallet => !filter || wallet.name.toLowerCase().includes(filter.toLowerCase())));

	function clickManageWallets() {
		$settingsModal.open('wallets');
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
<Input bind:value={filter} placeholder="Filter wallets..." />

{#if filteredWallets.length > 0}
	<Table breakpoint="0">
		<Thead>
			<TheadTr>
				<Th>Wallet name</Th>
			</TheadTr>
		</Thead>
		<Tbody>
			{#each filteredWallets as wallet, index}
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

<Modal title="Manage wallets" body={ModalWallets} bind:this={elModalWallets} />
