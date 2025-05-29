<script>
	import Item from '../components/balance-item.svelte';
	let tokens = [
		{
			icon: 'https://raw.githubusercontent.com/libersoft-org/blockchain-icons/refs/heads/main/tokens/DAI.svg',
			symbol: 'DAI',
			amount: {
				crypto: 105,
				fiat: 104.98,
			},
		},
		{
			icon: 'https://raw.githubusercontent.com/libersoft-org/blockchain-icons/refs/heads/main/tokens/DOT.svg',
			symbol: 'DOT',
			amount: {
				crypto: 13.58468432,
				fiat: 815.23,
			},
		},
	];

	function selectToken(id) {
		console.log('SELECTED TOKEN:', id);
	}
</script>

<div class="items">
	{#each tokens as t, index}
		<Item className={index % 2 === 0 ? 'even' : 'odd'} icon={t.icon} symbol={t.symbol} amount={t.amount} onClick={() => selectToken(index)} />
	{/each}
</div>

<style>
	.items {
		border-radius: 10px;
		overflow: auto;
	}
</style>
