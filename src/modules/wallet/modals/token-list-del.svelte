<script>
 import Button from '../../../core/components/button.svelte';
 export let params;
 export let item;
</script>

<style>
</style>

<div>Would you like to delete the item: {item.name}?</div>
<Button text="Delete" on:click={() => params.onDel(item)} />
