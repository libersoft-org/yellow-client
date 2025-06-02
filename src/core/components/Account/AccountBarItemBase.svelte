<script lang="ts">
	import AccountBarButton from './AccountBarButton.svelte';
	import Icon from '../Icon/Icon.svelte';
	interface Props {
		img?: string;
		title?: string;
		onClick?: (e: Event) => void;
	}
	let { img, title, onClick }: Props = $props();
</script>

<style>
	.item-base {
		display: flex;
		gap: 10px;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
</style>

<AccountBarButton {onClick}>
	<div class="item-base">
		{#if img}
			<Icon {img} alt={title} size="20px" padding="0px" colorVariable="--secondary-foreground" />
		{/if}
		{#if title}
			<div>{title}</div>
		{/if}
	</div>
</AccountBarButton>
