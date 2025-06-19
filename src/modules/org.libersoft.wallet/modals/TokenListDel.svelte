<script>
	import Button from '@/core/components/Button/Button.svelte';
	export let close;
	export let params;

	function deleteItem() {
		params.onDel(params.item);
		close();
	}
</script>

<div>
	<span>Would you like to delete the item: </span>
	<span class="bold">{params.item.name}?</span>
</div>
<Button img="img/del.svg" text="Delete" onClick={deleteItem} />
