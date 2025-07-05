<script lang="ts">
	import { hideSidebarMobile } from '@/core/stores.ts';
	import { addressBook, setSection, setSendAddress } from '../../scripts/wallet.ts';
	import { module } from '../../scripts/module.ts';
	import SidebarButton from '@/core/components/Sidebar/SidebarButton.svelte';
	import Item from '@/core/components/Sidebar/SidebarItem.svelte';

	function clickShowContent() {
		hideSidebarMobile.set(true);
	}

	function clickItem(address) {
		console.log('SIDEBAR ADDRESS ITEM:', address);
		// TODO: check if send is not disabled !!!
		setSection('send');
		setSendAddress(address);
		hideSidebarMobile.set(true);
	}
</script>

<style>
	.addressbook {
		overflow: auto;
	}

	.name {
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

<SidebarButton img="modules/{module.identifier}/img/wallet.svg" text="Show wallet" visibleOnDesktop={false} onClick={clickShowContent} />
<div class="addressbook">
	{#if $addressBook.length > 0}
		{#each $addressBook as a, index}
			<Item even={index % 2 === 0 ? false : true} onClick={() => clickItem(a.address)}>
				<div class="name">{a.name}</div>
				<div class="address">{a.address}</div>
			</Item>
		{/each}
	{/if}
</div>
