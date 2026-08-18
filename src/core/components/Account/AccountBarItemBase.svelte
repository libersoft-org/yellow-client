<script lang="ts">
	import AccountBarButton from '@/core/components/Account/AccountBarButton.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	interface Props {
		img?: string;
		title?: string;
		onClick?: (e: Event) => void;
		testId?: string;
	}
	let { img, title, onClick, testId }: Props = $props();
</script>

<style>
	.item-base {
		display: flex;
		gap: 10px;
		min-width: 0;
	}

	.title {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
</style>

<AccountBarButton {onClick} data-testid={testId}>
	<div class="item-base">
		{#if img}
			<Icon {img} alt={title} size="20px" padding="0px" colorVariable="--secondary-foreground" />
		{/if}
		{#if title}
			<div class="title">{title}</div>
		{/if}
	</div>
</AccountBarButton>
