<script lang="ts">
	import { selectAddress, walletsModal } from '../../wallet.ts';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import { get } from 'svelte/store';

	interface Props {
		params: {
			wallet: any;
		};
		close?: () => void;
	}

	let { params, close }: Props = $props();
	let { wallet } = params;

	function clickSelectAddress(address) {
		console.log('SELECTING ADDRESS', wallet, address);
		selectAddress(wallet, address);
		get(walletsModal)?.close();
	}
</script>

<Table breakpoint="0">
	<Thead>
		<TheadTr>
			<Th>Index</Th>
			<Th>Name</Th>
			<Th>Address</Th>
		</TheadTr>
	</Thead>
	<Tbody>
		{#if wallet.addresses && wallet.addresses.length > 0}
			{#each wallet.addresses as address}
				<Clickable onClick={() => clickSelectAddress(address)}>
					<TbodyTr>
						<Td>{address.index}</Td>
						<Td>{address.name}</Td>
						<Td>{address.address}</Td>
					</TbodyTr>
				</Clickable>
			{/each}
		{:else}
			<TbodyTr>
				<Td colspan={3} style="text-align: center; padding: 20px;">No addresses found for this wallet</Td>
			</TbodyTr>
		{/if}
	</Tbody>
</Table>
