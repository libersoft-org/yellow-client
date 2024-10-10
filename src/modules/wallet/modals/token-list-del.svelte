<script>
 import Button from '../../../core/components/button.svelte';
 export let show;
 export let params;
 export let item;
 export let onDel;
</script>

<style>
</style>

<div>Would you like to delete the item: {item.name}?</div>
<Button text="Delete" on:click={() => onDel(item)} />
