<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { setModule } from '@/core/core.ts';
	import { hideSidebarMobile } from '@/core/stores.ts';
	import Content from '@/core/components/Content/Content.svelte';
	import Bar from '@/core/components/Content/ContentBar.svelte';
	import BarTitle from '@/core/components/Content/ContentBarTitle.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Page from '@/core/components/Content/ContentPage.svelte';
	import Wallet from '../Wallet.svelte';

	onMount(() => {
		hideSidebarMobile.set(true);
		window.addEventListener('keydown', onKeydown);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') window.removeEventListener('keydown', onKeydown);
	});

	async function onKeydown(event) {
		if (event.key === 'Escape') setModule(null);
	}

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
			<Icon img="img/cross.svg" onClick={close} colorVariable="--secondary-foreground" visibleOnMobile={false} />
		{/snippet}
	</Bar>
	<Page hAlign="center">
		<Wallet />
	</Page>
</Content>
