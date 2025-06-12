<script>
	export let img = 'img/photo.svg';
	export let alt = '';
	export let size = '50px';
	export let radius = '50%';
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
