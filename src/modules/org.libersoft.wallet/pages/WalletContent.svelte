<script>
	import { onMount } from 'svelte';
	import { hideSidebarMobile, selected_module_id } from '@/core/stores.ts';
	import { selectedNetwork, selectedAddress } from '../wallet.ts';
	import Content from '@/core/components/Content/Content.svelte';
	import TopBar from '@/core/components/TopBar/TopBar.svelte';
	import TopBarTitle from '@/core/components/TopBar/TopBarTitle.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Page from '@/core/components/Content/ContentPage.svelte';
	import Wallet from './Wallet.svelte';
	import Dropdown from '../components/Dropdown.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ModalNetworks from '../modals/Networks.svelte';
	import ModalWallets from '../modals/Wallets.svelte';
	let showModalNetworks = false;
	let showModalWallets = false;

	onMount(() => {
		hideSidebarMobile.set(true);
	});

	selectedNetwork.subscribe(v => {
		console.log('selectedNetwork', v);
	});

	selectedAddress.subscribe(v => {
		console.log('selectedAddress', v);
	});

	function back() {
		hideSidebarMobile.set(false);
	}

	function close() {
		selected_module_id.set(null);
	}
</script>

<Content>
	<TopBar>
		{#snippet left()}
			<TopBarTitle text="Wallet" />
			<Icon img="img/back.svg" onClick={back} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
		{/snippet}
		{#snippet right()}
			<Dropdown text={$selectedNetwork ? $selectedNetwork.name : '--- Select your network ---'} colorVariable="--secondary-foreground" onClick={() => (showModalNetworks = true)} />
			<Dropdown text={$selectedAddress ? $selectedAddress.name : '--- Select your address ---'} colorVariable="--secondary-foreground" onClick={() => (showModalWallets = true)} />
			<Icon img="img/close.svg" onClick={close} colorVariable="--secondary-foreground" visibleOnMobile={false} />
		{/snippet}
	</TopBar>
	<Page>
		<Wallet />
	</Page>
</Content>
<Modal title="Select your network" body={ModalNetworks} bind:show={showModalNetworks} width="500px" />
<Modal title="Select your address" body={ModalWallets} bind:show={showModalWallets} width="500px" />
