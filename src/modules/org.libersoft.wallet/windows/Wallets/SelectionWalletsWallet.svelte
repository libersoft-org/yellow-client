<script lang="ts">
	import { selectAddress } from '@/org.libersoft.wallet/scripts/crypto-utils/wallet';
	import { walletsWindow } from '@/org.libersoft.wallet/scripts/ui';
	import Input from '@/core/components/Input/Input.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import { get } from 'svelte/store';
	interface Props {
		params: {
			wallet: any;
		};
		close?: () => void;
	}
	let { params, close }: Props = $props();
	let { wallet } = params;
	let filter = $state('');
	let filteredAddresses = $derived((wallet.addresses || []).filter(address => address.name.toLowerCase().includes(filter.toLowerCase()) || address.address.toLowerCase().includes(filter.toLowerCase()) || address.index.toString().includes(filter)));
	let elFilter: Input | undefined = $state();

	export function onOpen(): void {
		elFilter?.focus();
	}

	function clickSelectAddress(address) {
		console.log('SELECTING ADDRESS', wallet, address);
		selectAddress(wallet, address);
		get(walletsWindow)?.close();
	}
</script>

<Input placeholder="Filter addresses..." bind:value={filter} bind:this={elFilter} />
<Table breakpoint="0">
	<Thead>
		<TheadTr>
			<Th>Index</Th>
			<Th>Name</Th>
			<Th>Address</Th>
		</TheadTr>
	</Thead>
	<Tbody>
		{#if filteredAddresses && filteredAddresses.length > 0}
			{#each filteredAddresses as address}
				<TbodyTr onClick={() => clickSelectAddress(address)} data-testid="wallet-address-{address.index}">
					<Td>{address.index}</Td>
					<Td>{address.name}</Td>
					<Td>{address.address}</Td>
				</TbodyTr>
			{/each}
		{:else}
			<TbodyTr>
				<Td colspan={3} style="text-align: center; padding: 20px;">{filter ? 'No addresses match your filter' : 'No addresses found for this wallet'}</Td>
			</TbodyTr>
		{/if}
	</Tbody>
</Table>
