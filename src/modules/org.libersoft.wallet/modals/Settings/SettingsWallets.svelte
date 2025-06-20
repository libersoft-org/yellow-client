<script>
	import { module } from '../../module.ts';
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

<ButtonBar equalize>
	<Button img="modules/{module.identifier}/img/wallet-add.svg" text="Create wallet" onClick={showNewWalletModal} />
	<Button img="modules/{module.identifier}/img/recover.svg" text="Recover" onClick={recover} />
</ButtonBar>
{#if $wallets.length > 0}
	<div class="bold">My wallets:</div>
{/if}
{#if $wallets.length === 0}
	<div class="bold">No wallets found</div>
{/if}
<Accordion items={$wallets} bind:this={accordion}>
	{#snippet content(walleta)}
		<div class="wallet">
			<ButtonBar>
				<Button img="modules/{module.identifier}/img/wallet-address-add.svg" text="Add address" onClick={() => addAddress(walleta)} />
				<Button img="modules/{module.identifier}/img/wallet-address-add.svg" text="Add address by index" onClick={() => addAddressWithIndex(walleta)} />
			</ButtonBar>
			<Table>
				<Thead>
					<Th>Index</Th>
					<Th>Alias</Th>
					<Th>Address</Th>
					<Th>Action</Th>
				</Thead>
				<Tbody>
					{#each walletAddresses(walleta) as address}
						<TbodyTr>
							<Td title="Index">{address.index}</Td>
							<Td title="Alias">{address.name}</Td>
							<Td title="Address"><Address address={address.address} /></Td>
							<Td title="Action">
								<TableActionItems>
									<Icon img="img/edit.svg" colorVariable="--primary-foreground" alt="Rename" size="20px" padding="5" onClick={() => renameAddress(walleta, address)} />
									<Icon img="img/del.svg" colorVariable="--primary-foreground" alt="Hide" size="20px" padding="5" onClick={() => deleteAddress(walleta, address)} />
								</TableActionItems>
							</Td>
						</TbodyTr>
					{/each}
				</Tbody>
			</Table>
		</div>
	{/snippet}
</Accordion>
<Modal title="New wallet" body={ModalNewWallet} bind:show={showModalPhrase} />
