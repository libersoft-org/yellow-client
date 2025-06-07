<script>
	import { onMount } from 'svelte';
	import { setModule } from '@/core/core.ts';
	import { hideSidebarMobile } from '@/core/stores.ts';
	import { selectedNetwork, selectedAddress } from '../wallet.ts';
	import Content from '@/core/components/Content/Content.svelte';
	import Bar from '@/core/components/Content/ContentBar.svelte';
	import BarTitle from '@/core/components/Content/ContentBarTitle.svelte';
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
		setModule(null);
	}
</script>

<Content>
	<Bar position="bottom">
		{#snippet left()}
			<Icon img="img/back.svg" onClick={back} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
			<BarTitle text="Wallet" />
		{/snippet}
		{#snippet right()}
			<Dropdown text={$selectedNetwork ? $selectedNetwork.name : '--- Select your network ---'} colorVariable="--secondary-foreground" onClick={() => (showModalNetworks = true)} />
			<Dropdown text={$selectedAddress ? $selectedAddress.name : '--- Select your address ---'} colorVariable="--secondary-foreground" onClick={() => (showModalWallets = true)} />
			<Icon img="img/close.svg" onClick={close} colorVariable="--secondary-foreground" visibleOnMobile={false} />
		{/snippet}
	</Bar>
	<Page>
		<Wallet />
	</Page>
</Content>
<Modal title="Select your network" body={ModalNetworks} bind:show={showModalNetworks} width="500px" />
<Modal title="Select your address" body={ModalWallets} bind:show={showModalWallets} width="500px" />
