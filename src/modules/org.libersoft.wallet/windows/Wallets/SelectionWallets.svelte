<script lang="ts">
	import { wallets, selectAddress } from 'libersoft-crypto/wallet';
	import { walletsWindow, settingsWindow } from '@/org.libersoft.wallet/scripts/ui';
	import { module } from '@/org.libersoft.wallet/scripts/module';
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
	let elFilter: Input | undefined = $state();

	export function onOpen(): void {
		elFilter?.focus();
	}

	function clickManageWallets() {
		$settingsWindow?.open('wallets');
	}

	async function clickSelectWallet(wallet) {
		console.log('SELECTING WALLET', wallet);
		await $walletsWindow?.setSettingsSection('wallets-' + wallet.guid);
	}
</script>

<style>
</style>

<Button img="modules/{module.identifier}/img/wallet.svg" text="Manage wallets" onClick={clickManageWallets} />
<Input placeholder="Filter wallets..." bind:value={filter} bind:this={elFilter} />
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
					<Td padding="0 10px" class="ellipsis">
						<Clickable onClick={async () => await clickSelectWallet(wallet)} data-wallet-name={wallet.name}>
							<span>{wallet.name}</span>
						</Clickable>
					</Td>
				</TbodyTr>
			{/each}
		</Tbody>
	</Table>
{/if}

<Window title="Manage wallets" body={WindowWallets} bind:this={elWindowWallets} />
