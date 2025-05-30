<script>
	import BaseButton from '../Button/BaseButton.svelte';
	import Icon from '../Icon/Icon.svelte';
	export let img;
	export let title = '';
	export let onClick;
</script>

<style>
	.accounts-button {
		display: flex;
		gap: 10px;
		padding: 10px;
		width: 100%;
	}

	/*.accounts-button img {
  width: 20px;
  height: 20px;
 }*/

	.accounts-button:hover {
		background-color: #222;
	}
</style>

<BaseButton {onClick}>
	<div class="accounts-button">
		{#if img}
			<Icon {img} alt={title} size="20px" padding="0px" colorVariable="--primary-foreground" />
			<!--<div><img src={img} alt={title} /></div>-->
		{/if}
		<div>{title}</div>
	</div>
</BaseButton>
