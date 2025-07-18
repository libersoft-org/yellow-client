<script lang="ts">
	import { hideSidebarMobile } from '@/core/scripts/stores.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import { setSection } from '@/org.libersoft.wallet/scripts/ui.ts';
	import { setSendAddress } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import { addressBook } from '@/org.libersoft.wallet/scripts/addressbook.ts';
	import SidebarButton from '@/core/components/Sidebar/SidebarButton.svelte';
	import Item from '@/core/components/Sidebar/SidebarItem.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	let filter = $state('');
	let filteredAddressBook = $derived($addressBook.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()) || item.address.toLowerCase().includes(filter.toLowerCase())));

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
		<div style="padding: 10px;">
			<Input placeholder="Filter addresses..." bind:value={filter} />
		</div>
		{#each filteredAddressBook as a, index}
			<Item even={index % 2 === 0 ? false : true} onClick={() => clickItem(a.address)}>
				<div class="name">{a.name}</div>
				<div class="address">{a.address}</div>
			</Item>
		{/each}
	{/if}
</div>
