<script>
	import { wallets, walletAddresses, selectAddress } from '../wallet.ts';
	import BaseButton from '@/core/components/Button/BaseButton.svelte';
	import Accordion from '@/core/components/Accordion/Accordion.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	export let close;
	let activeIndex = null;
	let filter = '';

	function clickSelectAddress(wallet, address) {
		console.log('SETTING ADDRESS', wallet, address);
		selectAddress(wallet, address);
		close();
	}
</script>

<Input placeholder="Search" bind:value={filter} />
<Accordion items={$wallets} bind:activeIndex>
	{#snippet content(wallet)}
		<table>
			<tbody>
				{#each walletAddresses(wallet) as address, index}
					<BaseButton onClick={() => clickSelectAddress(wallet, address)}>
						<tr class={index % 2 === 0 ? 'even' : 'odd'}>
							<td class="center">{address.index}</td>
							<td>{address.name}</td>
							<td>{address.address}</td>
						</tr>
					</BaseButton>
				{/each}
			</tbody>
		</table>
	{/snippet}
</Accordion>

<style>
	table {
		border-spacing: 0;
		overflow: hidden;
	}

	tr.even {
		background-color: var(--color-secondary-soft-background);
	}

	tr.odd {
		background-color: var(--color-primary-lighter-background);
	}

	tr:hover {
		background-color: var(--color-primary-background);
	}

	td {
		padding: 5px;
	}
</style>
