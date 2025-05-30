<script>
	import { hideSidebarMobile } from '@/core/core.js';
	import { addressBook } from '../wallet.ts';
	import BaseButton from '@/core/components/Button/BaseButton.svelte';

	function clickShowWallet() {
		hideSidebarMobile.set(true);
	}

	function clickItem(address) {
		console.log('SIDEBAR ADDRESS ITEM:', address);
		//hideSidebarMobile.set(true);
	}
</script>

<style>
	.content-button {
		padding: 10px;
		font-weight: bold;
		background-color: #222;
		color: #fff;
		width: 100%;
	}

	.addressbook {
		overflow: auto;
	}

	.items .item {
		display: flex;
		flex-direction: column;
		padding: 10px;
		border: 1px solid #dd9;
		width: 100%;
		background-color: var(--primary-background);
	}

	.items .item:hover {
		background-color: var(--primary-background);
	}

	.items .item .alias {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		font-weight: bold;
	}

	.items .item .address {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		font-size: 12px;
		color: #555;
	}

	@media (min-width: 769px) {
		.content-button {
			display: none;
		}
	}
</style>

<BaseButton onClick={clickShowWallet}>
	<div class="content-button">Show wallet</div>
</BaseButton>
<div class="addressbook">
	{#if $addressBook.length > 0}
		<div class="items">
			{#each $addressBook as a, index}
				<BaseButton onClick={() => clickItem(a.address)} width="100%">
					<div class="item {index % 2 === 0 ? 'even' : 'odd'}">
						<div class="alias">{a.alias}</div>
						<div class="address">{a.address}</div>
					</div>
				</BaseButton>
			{/each}
		</div>
	{/if}
</div>
