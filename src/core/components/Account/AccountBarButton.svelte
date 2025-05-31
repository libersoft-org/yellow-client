<script lang="ts">
	import BaseButton from '../Button/BaseButton.svelte';
	interface Props {
		onClick?: (e: Event) => void;
	}
	let { onClick }: Props = $props();
</script>

<style>
	.accounts-button {
		display: flex;
		flex: 1;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		padding: 10px;
	}

	.accounts-button:hover {
		background-color: var(--secondary-softer-background);
	}
</style>

<BaseButton {onClick}>
	<div class="accounts-button">
		<slot />
	</div>
</BaseButton>
