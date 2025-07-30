<script lang="ts">
	import { type Snippet, tick } from 'svelte';
	import Window from '@/core/components/Window/Window.svelte';
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
		focus?: boolean;
	}
	let { data, width }: Props = $props();
	let elWindow: Window;
	let buttonElements: (Button | undefined)[] = [];

	export async function open() {
		elWindow?.open();
		await tick();
		await tick();
		const focusButton = data?.buttons?.find(button => button.focus);
		if (focusButton && data?.buttons) {
			const focusIndex = data.buttons.indexOf(focusButton);
			if (focusIndex !== -1 && buttonElements[focusIndex]) {
				buttonElements[focusIndex]?.focus();
			}
		}
	}

	export function close() {
		elWindow?.close();
	}
</script>

<style>
	.top {
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}
</style>

<Window title={data?.title} {width} bind:this={elWindow}>
	{#snippet top()}
		<div class="top">
			{#if data?.icon}
				<Icon img={data?.icon} alt="" colorVariable="--primary-foreground" size="50px" padding="0px" />
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
				{#each data.buttons as button, index}
					<Button {...button} data-testid={button.testId} bind:this={buttonElements[index]} />
				{/each}
			</ButtonBar>
		{/if}
	{/snippet}
</Window>
