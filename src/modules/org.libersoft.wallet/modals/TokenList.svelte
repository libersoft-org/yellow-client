<script>
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ModalAddEdit from './TokenListAddEdit.svelte';
	import ModalDel from './TokenListDel.svelte';
	import { networks } from '../wallet.ts';
	import { module } from '../module.ts';
	export let params;
	let net;
	let elModalAddEdit;
	let elModalDel;
	let modalItem = null;

	$: update($networks, params);

	function update(nets, params) {
		console.log('NETS:', nets, 'PARAMS:', params);
		let res = nets.find(v => v.guid === params.item);
		console.log('RES:', res);
		net = res;
		console.log('NET:', net);
	}

	console.log('NET:', net);

	function addTokenModal() {
		console.log('ADD TOKEN MODAL');
		modalItem = null;
		elModalAddEdit?.open();
	}

	function onAdd(token) {
		console.log('ADD TOKEN:', token);
		console.log('ADD TOKEN:', net);
		net.tokens.push(token);
		networks.update(v => v);
	}

	function editTokenModal(item) {
		console.log('EDIT TOKEN MODAL:', item);
		modalItem = item;
		elModalAddEdit?.open();
	}

	function onEdit(token) {
		console.log('EDIT TOKEN:', token);
		net.tokens = net.tokens.map(t => (t.guid === token.guid ? token : t));
		networks.update(v => v);
	}

	function delTokenModal(item) {
		console.log('DELETE TOKEN MODAL:', item);
		modalItem = item;
		elModalDel?.open();
	}

	function onDel(token) {
		console.log('DELETE TOKEN:', token);
		net.tokens = net.tokens.filter(t => t.guid !== token.guid);
		networks.update(v => v);
	}
</script>

<style>
	.token-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>

<div class="token-list">
	<ButtonBar>
		<!-- () => (item_tokens = [...item_tokens, { name: '', icon: '', symbol: '', contract_address: '' }]) -->
		<Button img="modules/{module.identifier}/img/token-add.svg" text="Add token" onClick={addTokenModal} />
	</ButtonBar>
	<div class="label">Network name: {net?.name}</div>
	<div class="label">Tokens:</div>
	{#if net?.tokens}
		<Table>
			<Thead>
				<TheadTr>
					<Th>Name</Th>
					<Th>Icon</Th>
					<Th>Symbol</Th>
					<Th>Token address</Th>
					<Th>Action</Th>
				</TheadTr>
			</Thead>
			<Tbody>
				{#each net.tokens as t, i}
					<TbodyTr>
						<Td>{t.name}</Td>
						<Td>{t.icon}</Td>
						<Td>{t.symbol}</Td>
						<Td>{t.contract_address}</Td>
						<Td>
							<div class="icons">
								<!-- () => (item_tokens = item_tokens.filter((v, j) => j !== i)) -->
								<Icon img="img/edit.svg" alt="Edit token" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => editTokenModal(t)} />
								<Icon img="img/del.svg" alt="Delete token" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => delTokenModal(t)} />
							</div>
						</Td>
					</TbodyTr>
				{/each}
			</Tbody>
		</Table>
	{/if}
</div>
<Modal title={modalItem ? 'Edit token' : 'Add token'} body={ModalAddEdit} params={{ item: modalItem, onAdd, onEdit }} bind:this={elModalAddEdit} />
<Modal title="Delete token" body={ModalDel} params={{ item: modalItem, onDel: onDel }} bind:this={elModalDel} />
