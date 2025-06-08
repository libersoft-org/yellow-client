<script>
	import { onMount } from 'svelte';
	import { hideSidebarMobile, setModule } from '@/core/core.ts';
	import Bar from '@/core/components/Content/ContentBar.svelte';
	import BarTitle from '@/core/components/Content/ContentBarTitle.svelte';
	import Content from '@/core/components/Content/Content.svelte';
	import Page from '@/core/components/Content/ContentPage.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';

	// TEST: Dialog
	let elDialog;
	let dialogData = {
		title: 'Dialog title',
		body: 'Dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content.',
		icon: 'img/photo.svg',
		buttons: [
			{ text: 'Abort', onClick: clickButton, expand: true },
			{ text: 'Retry', onClick: clickButton, expand: true },
			{ text: 'Close', onClick: () => elDialog.close(), expand: true },
		],
	};

	onMount(() => {
		elDialog.open();
	});

	function clickButton() {
		console.log('Clicked on button');
	}

	function back() {
		hideSidebarMobile.set(false);
	}

	function close() {
		setModule(null);
	}
</script>

<Content>
	<Bar>
		{#snippet left()}
			<Icon img="img/back.svg" onClick={back} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
			<BarTitle text="Contact list" />
		{/snippet}
		{#snippet right()}
			<Icon img="img/close.svg" onClick={close} colorVariable="--secondary-foreground" visibleOnMobile={false} />
		{/snippet}
	</Bar>
	<Page>
		<div>Contact list - content page - not yet implemented</div>
	</Page>
</Content>
<Dialog data={dialogData} width="400px" bind:this={elDialog} />
