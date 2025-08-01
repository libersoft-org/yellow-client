<script lang="ts">
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	interface Props {
		address: string;
		colorVariable?: string;
	}
	let { address = $bindable(), colorVariable = '--primary-foreground' }: Props = $props();
	let copied = $state(false);
	let spanElem = $state();

	function copyAddressToClipboard() {
		navigator.clipboard
			.writeText(address)
			.then(() => {
				copied = true;
				setTimeout(() => (copied = false), 1000);
			})
			.catch(err => console.error('Error while copying to clipboard', err));
	}
</script>

<style>
	.address {
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.text {
		display: inline-block;
		vertical-align: bottom;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		width: 100px; /* TODO: 100% doesnt work for some reason */
	}
</style>

<Clickable onClick={copyAddressToClipboard}>
	<div class="address">
		<span class="text" bind:this={spanElem}>{copied ? 'Copied!' : address}</span>
		<Icon img="img/copy.svg" {colorVariable} alt="Copy" size="15px" padding="0px" />
	</div>
</Clickable>
