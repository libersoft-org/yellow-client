<script lang="ts">
	import { type Snippet } from 'svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	interface Props {
		data?: IDialogData;
		width?: string;
	}
	export interface IDialogData {
		title?: string;
		body?: string | Snippet;
		icon?: string;
		buttons?: IDialogButton[];
	}
	export interface IDialogButton {
		img?: string;
		text?: string;
		onClick?: (e: Event) => void;
		expand?: boolean;
		testId?: string;
	}
	let { data, width }: Props = $props();
	let elModal: Modal;

	export function open() {
		elModal?.open();
	}

	export function close() {
		elModal?.close();
	}
</script>

<style>
	.top {
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}
</style>

<Modal title={data?.title} {width} bind:this={elModal}>
	{#snippet top()}
		<div class="top">
			{#if data?.icon}
				<Icon img={data?.icon} alt="" size="50px" padding="0px" />
			{/if}
			{#if data?.body}
				<div>
					{#if typeof data.body === 'string'}
						{@html data.body}
					{:else}
						{@render data.body()}
					{/if}
				</div>
			{/if}
		</div>
	{/snippet}
	{#snippet bottom()}
		{#if data?.buttons && data.buttons.length > 0}
			<ButtonBar expand>
				{#each data.buttons as button}
					<Button {...button} data-testid={button.testId} />
				{/each}
			</ButtonBar>
		{/if}
	{/snippet}
</Modal>
