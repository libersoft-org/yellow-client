<script>
	import { onMount } from 'svelte';
	import { hideSidebarMobile } from '@/core/core.ts';
	import { selected_module_id } from '@/core/stores.ts';
	import TopBar from '@/core/components/TopBar/TopBar.svelte';
	import TopBarTitle from '@/core/components/TopBar/TopBarTitle.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	let elDialog;
	let closeDialog;
	let dialogData = {
		title: 'Dialog title',
		body: 'Dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content.',
		icon: 'img/photo.svg',
		buttons: [
			{ text: 'Abort', onClick: clickButton, expand: true },
			{ text: 'Retry', onClick: clickButton, expand: true },
			{ text: 'Close', onClick: () => closeDialog(), expand: true },
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
		selected_module_id.set(null);
	}
</script>

<style>
	.content {
		height: 100vh;
		background: var(--background-image) 0 0 / 400px repeat;
		overflow: hidden;
	}
</style>

<TopBar>
	<svelte:fragment slot="left">
		<Icon img="img/back.svg" onClick={back} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
		<TopBarTitle text="Contact list" />
	</svelte:fragment>
	<svelte:fragment slot="right">
		<Icon img="img/close.svg" onClick={close} colorVariable="--secondary-foreground" visibleOnMobile={false} />
	</svelte:fragment>
</TopBar>
<div class="content">Contact list - content page - not yet implemented</div>
<Dialog data={dialogData} bind:close={closeDialog} bind:this={elDialog} />
