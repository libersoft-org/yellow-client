<script>
	import { wallets, walletAddresses, selectAddress } from '../wallet.ts';
	import BaseButton from '@/core/components/BaseButton/BaseButton.svelte';
	import Accordion from '@/core/components/Accordion/Accordion.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	export let close;
	let activeIndex = null;
	let filter = '';

	function clickSelectAddress(wallet, address) {
		console.log('SETTING ADDRESS', wallet, address);
		selectAddress(wallet, address);
		close();
	}
</script>

<style>
	table {
		border-spacing: 0;
		overflow: hidden;
	}

	tr.even {
		background-color: var(--secondary-soft-background);
	}

	tr.odd {
		background-color: var(--primary-lighter-background);
	}

	tr:hover {
		background-color: var(--primary-background);
	}

	td {
		padding: 5px;
	}
</style>

<Input placeholder="Search" bind:value={filter} />
<Accordion items={$wallets} bind:activeIndex>
	{#snippet content(wallet)}
		<Table breakpoint="0">
			<Tbody>
				{#each walletAddresses(wallet) as address, index}
					<BaseButton onClick={() => clickSelectAddress(wallet, address)}>
						<TbodyTr>
							<Td class="center">{address.index}</Td>
							<Td>{address.name}</Td>
							<Td>{address.address}</Td>
						</TbodyTr>
					</BaseButton>
				{/each}
			</Tbody>
		</Table>
	{/snippet}
</Accordion>
