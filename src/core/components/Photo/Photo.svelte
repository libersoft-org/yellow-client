<script lang="ts">
	interface Props {
		img?: string;
		alt?: string;
		size?: string;
		radius?: string;
	}
	let { img = 'img/photo.svg', alt, size = '50px', radius = '50%' }: Props = $props();
</script>

<style>
	.photo {
		border: 1px solid var(--default-foreground);
		background-color: var(--default-background);
		overflow: hidden;
	}

	.photo img {
		display: flex;
		margin: 5px;
		padding-top: 5px;
	}
</style>

<div class="photo" style="min-width: {size}; min-height: {size}; width: {size}; height: {size}; border-radius: {radius};">
	<img src={img} {alt} />
</div>
