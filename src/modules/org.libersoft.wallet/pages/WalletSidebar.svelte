<script>
	import { hideSidebarMobile } from '@/core/core.ts';
	import { addressBook } from '../wallet.ts';
	import { isMobile } from '@/core/stores.ts';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Item from '@/core/components/SidebarItem/SidebarItem.svelte';

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
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
		width: 100%;
	}

	.content-button.mobile {
		display: none;
	}

	.addressbook {
		overflow: auto;
	}

	.alias {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		font-weight: bold;
	}

	.address {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		font-size: 12px;
	}
</style>

<Clickable onClick={clickShowWallet}>
	<div class="content-button {!$isMobile}">Show wallet</div>
</Clickable>
<div class="addressbook">
	{#if $addressBook.length > 0}
		{#each $addressBook as a, index}
			<Item even={index % 2 === 0 ? true : false} onClick={() => clickItem(a.address)}>
				<div class="alias">{a.alias}</div>
				<div class="address">{a.address}</div>
			</Item>
		{/each}
	{/if}
</div>
