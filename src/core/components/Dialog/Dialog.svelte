<script>
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	export let data;
	let show = false;

	export function open() {
		show = true;
	}

	export function close() {
		show = false;
	}
</script>

<style>
	.top {
		display: flex;
		gap: 20px;
		padding: 10px;
	}
</style>

<Modal title={data.title} bind:show width="400px">
	<div class="top">
		{#if data.icon}
			<Icon img={data.icon} alt="" size="50px" padding="0px" />
		{/if}
		<div>{data.body}</div>
	</div>
	<ButtonBar>
		{#each data.buttons as button}
			<Button {...button} />
		{/each}
	</ButtonBar>
	<!-- <Button text="Close" onClick={() => (show = false)} /> -->
</Modal>
