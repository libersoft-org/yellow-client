<script>
	import { module } from '../../module.js';
	import { wallets, addAddress, addWallet, walletAddresses } from '../../wallet.ts';
	import ModalNewWallet from '../../modals/NewWallet.svelte';
	import Address from './SettingsWalletsAddress.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import TableActionItems from '@/core/components/Table/TableActionItems.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Accordion from '@/core/components/Accordion/Accordion.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import { Mnemonic } from 'ethers';
	let showModalPhrase = false;
	let accordion;

	function showNewWalletModal() {
		showModalPhrase = true;
	}

	function afterAddWallet() {
		accordion.handleClick(wallets.length - 1, true);
	}

	function recover() {
		let phrase = window.prompt('Enter your recovery phrase');
		if (!phrase) return;
		let mn = Mnemonic.fromPhrase(phrase);
		addWallet(mn, ' - recovered');
		afterAddWallet();
	}
	function addAddressWithIndex(wallet) {
		let index = window.prompt('Enter the index');
		if (!index) return;
		addAddress(wallet, index);
		wallet.addresses = [...wallet.addresses];
	}

	function renameAddress(wallet, address) {
		let name = window.prompt('Enter the new name');
		if (!name) return;
		address.name = name;
		wallet.addresses = [...wallet.addresses];
		wallets.update(ws =>
			ws.map(w =>
				w === wallet
					? {
							...w,
							addresses: (w.addresses || []).map(a => (a === address ? { ...a, name } : a)),
						}
					: w
			)
		);
	}

	function deleteAddress(w, address) {
		address.deleted = true;
		// wallet.addresses = [...wallet.addresses]
		wallets.update(ws =>
			ws.map(item =>
				item === w
					? {
							...item,
							addresses: [...w.addresses],
							selected_address_index: w.indexNum,
						}
					: item
			)
		);
	}
</script>

<style>
	.wallet {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 16px 10px;
	}

	.wallet:global(:has(tbody:empty) table) {
		display: none !important;
	}
</style>

<ButtonBar>
	<Button text="Create wallet" onClick={showNewWalletModal} testId="wallet-settings-create-wallet-btn" />
	<Button img="modules/{module.identifier}/img/recover.svg" colorVariable="--primary-foreground" text="Recover" onClick={recover} testId="wallet-settings-recover-wallet-btn" />
</ButtonBar>
{#if $wallets.length > 0}
	<div class="bold" data-testid="wallet-settings-wallets-title">My wallets:</div>
{/if}
{#if $wallets.length === 0}
	<div class="bold" data-testid="wallet-settings-no-wallets-message">No wallets found</div>
{/if}
<Accordion items={$wallets} bind:this={accordion} testId="wallet-settings-wallets-accordion">
	{#snippet content(walleta, walletIndex)}
		<div class="wallet" data-testid="wallet-settings-wallet{walletIndex}-content">
			<ButtonBar>
				<Button text="Add a new address" onClick={() => addAddress(walleta)} testId="wallet-settings-wallet{walletIndex}-add-address-btn" />
				<Button text="Add a new address (by index)" onClick={() => addAddressWithIndex(walleta)} testId="wallet-settings-wallet{walletIndex}-add-address-by-index-btn" />
			</ButtonBar>
			<Table>
				<Thead>
					<Th>Index</Th>
					<Th>Alias</Th>
					<Th>Address</Th>
					<Th>Action</Th>
				</Thead>
				<Tbody>
					{#each walletAddresses(walleta) as address, addressIndex}
						<TbodyTr>
							<Td title="Index" testId="wallet-settings-wallet{walletIndex}-address{address.index}-index">{address.index}</Td>
							<Td title="Alias" testId="wallet-settings-wallet{walletIndex}-address{address.index}-alias">{address.name}</Td>
							<Td title="Address" testId="wallet-settings-wallet{walletIndex}-address{address.index}-value"><Address address={address.address} /></Td>
							<Td title="Action" testId="wallet-settings-wallet{walletIndex}-address{address.index}-actions">
								<TableActionItems>
									<Icon img="img/edit.svg" colorVariable="--primary-foreground" alt="Rename" size="20px" padding="5" onClick={() => renameAddress(walleta, address)} testId="wallet-settings-wallet{walletIndex}-address{address.index}-rename-btn" />
									<Icon img="img/del.svg" colorVariable="--primary-foreground" alt="Hide" size="20px" padding="5" onClick={() => deleteAddress(walleta, address)} testId="wallet-settings-wallet{walletIndex}-address{address.index}-delete-btn" />
								</TableActionItems>
							</Td>
						</TbodyTr>
					{/each}
				</Tbody>
			</Table>
		</div>
	{/snippet}
</Accordion>
<Modal title="New wallet" body={ModalNewWallet} bind:show={showModalPhrase} testId="wallet-settings-new-wallet-modal" />
