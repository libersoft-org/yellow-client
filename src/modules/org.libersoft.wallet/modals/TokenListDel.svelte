<script>
	import Button from '@/core/components/Button/Button.svelte';
	export let close;
	export let params;

	function deleteItem() {
		params.onDel(params.item);
		close();
	}
</script>

<div>Would you like to delete the item: {params.item.name}?</div>
<Button text="Delete" onClick={deleteItem} />
