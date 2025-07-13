<script lang="ts">
	import { wallets, selectAddress, walletsWindow, settingsWindow } from '../../scripts/wallet.ts';
	import { module } from '../../scripts/module.ts';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Window from '@/core/components/Window/Window.svelte';
	import WindowWallets from '../Settings/SettingsWallets.svelte';
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
	let elWindowWallets: Window | undefined;
	let filter: string | undefined = $state();

	let filteredWallets = $derived($wallets.filter(wallet => !filter || wallet.name.toLowerCase().includes(filter.toLowerCase())));

	function clickManageWallets() {
		$settingsWindow.open('wallets');
	}

	async function clickSelectWallet(wallet) {
		console.log('SELECTING WALLET', wallet);
		await $walletsWindow.setSettingsSection('wallets-' + wallet.address);
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

<Window title="Manage wallets" body={WindowWallets} bind:this={elWindowWallets} />
