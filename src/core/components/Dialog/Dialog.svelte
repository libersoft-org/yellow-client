<script lang="ts">
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	interface Props {
		data?: DialogData;
		width?: string;
	}
	interface DialogData {
		title?: string;
		body?: string;
		icon?: string;
		buttons?: DialogButton[];
	}
	interface DialogButton {
		text: string;
		onClick?: (e: Event) => void;
		expand?: boolean;
	}
	let { data, width }: Props = $props();
	let show = $state(false);

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
	}
</style>

<Modal title={data?.title} bind:show {width}>
	{#snippet top()}
		<div class="top">
			{#if data?.icon}
				<Icon img={data?.icon} alt="" size="50px" padding="0px" />
			{/if}
			<div>{@html data?.body}</div>
		</div>
	{/snippet}
	{#snippet bottom()}
		{#if data?.buttons && data.buttons.length > 0}
			<ButtonBar expand>
				{#each data.buttons as button}
					<Button {...button} />
				{/each}
			</ButtonBar>
		{/if}
	{/snippet}
</Modal>
