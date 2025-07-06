<script>
	import { networks } from '../../scripts/wallet.ts';
	import { module } from '../../scripts/module.ts';
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
	import Window from '@/core/components/Window/Window.svelte';
	import WindowAddEdit from './NetworksTokensAddEdit.svelte';
	import DialogTokenDel from '../../dialogs/NetworksTokensDel.svelte';
	export let params;
	let net;
	let tokenToDelete;
	let elWindowAddEdit;
	let elDialogDel;
	let windowItem = null;

	$: update($networks, params);

	function update(nets, params) {
		console.log('NETS:', nets, 'PARAMS:', params);
		let res = nets.find(v => v.guid === params.item);
		console.log('RES:', res);
		net = res;
		console.log('NET:', net);
	}

	console.log('NET:', net);

	function addTokenWindow() {
		console.log('ADD TOKEN WINDOW');
		windowItem = null;
		elWindowAddEdit?.open();
	}

	function onAdd(token) {
		console.log('ADD TOKEN:', token);
		console.log('ADD TOKEN:', net);
		net.tokens.push(token);
		networks.update(v => v);
	}

	function editTokenWindow(item) {
		console.log('EDIT TOKEN WINDOW:', item);
		windowItem = item;
		elWindowAddEdit?.open();
	}

	function onEdit(token) {
		console.log('EDIT TOKEN:', token);
		net.tokens = net.tokens.map(t => (t.guid === token.guid ? token : t));
		networks.update(v => v);
	}

	function delTokenWindow(item) {
		console.log('DELETE TOKEN WINDOW:', item);
		tokenToDelete = item;
		elDialogDel?.open();
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
	<div>
		<span class="bold">Network:</span>
		<span>{net?.name}</span>
	</div>
	<ButtonBar>
		<Button img="modules/{module.identifier}/img/token-add.svg" text="Add token" onClick={addTokenWindow} />
	</ButtonBar>
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
						<Td title="Name">{t.name}</Td>
						<Td title="Icon">{t.icon}</Td>
						<Td title="Symbol">{t.symbol}</Td>
						<Td title="Token address">{t.contract_address}</Td>
						<Td title="Action">
							<Icon img="img/edit.svg" alt="Edit token" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => editTokenWindow(t)} />
							<Icon img="img/del.svg" alt="Delete token" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => delTokenWindow(t)} />
						</Td>
					</TbodyTr>
				{/each}
			</Tbody>
		</Table>
	{/if}
</div>
<Window title={windowItem ? 'Edit token' : 'Add token'} body={WindowAddEdit} params={{ item: windowItem, onAdd, onEdit }} bind:this={elWindowAddEdit} />
<DialogTokenDel networkGuid={net?.guid} token={tokenToDelete} bind:this={elDialogDel} />
