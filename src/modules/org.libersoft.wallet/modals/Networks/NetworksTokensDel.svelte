<script lang="ts">
	import Button from '@/core/components/Button/Button.svelte';
	interface Props {
		close: () => void;
		params: {
			item: { name: string };
			onDel: (item: { name: string }) => void;
		};
	}
	let { close, params }: Props = $props();

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
