<script>
	import { selectedNetworkID, networks } from '../wallet.ts';
	import InputButton from '@/core/components/Input/InputButton.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	export let close;
	let filter = '';

	function selectNetwork(id) {
		console.log('SETTING NETWORK', id);
		selectedNetworkID.set(id);
		close();
	}
</script>

<InputButton img="img/search.svg" placeholder="Search" bind:value={filter} />
<Table breakpoint="0">
	<Tbody>
		{#each $networks as n, index}
			<TbodyTr>
				<Clickable onClick={() => selectNetwork(n.guid)}>
					<Td>
						<Icon img={n.currency.iconURL} />{n.name}
					</Td>
				</Clickable>
			</TbodyTr>
		{/each}
	</Tbody>
</Table>
