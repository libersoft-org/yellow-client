<script>
	import { wallets, walletAddresses, selectAddress } from '../wallet.ts';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Accordion from '@/core/components/Accordion/Accordion.svelte';
	import InputButton from '@/core/components/Input/InputButton.svelte';
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

<InputButton img="img/search.svg" placeholder="Search" bind:value={filter} />
<Accordion items={$wallets} bind:activeIndex>
	{#snippet content(wallet)}
		<Table breakpoint="0">
			<Tbody>
				{#each walletAddresses(wallet) as address, index}
					<Clickable onClick={() => clickSelectAddress(wallet, address)}>
						<TbodyTr>
							<Td class="center">{address.index}</Td>
							<Td>{address.name}</Td>
							<Td>{address.address}</Td>
						</TbodyTr>
					</Clickable>
				{/each}
			</Tbody>
		</Table>
	{/snippet}
</Accordion>
