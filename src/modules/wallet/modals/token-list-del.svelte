<script>
 import Button from '../../../core/components/button.svelte';
 export let item;
 export let onDel;

</script>

<style>
</style>

<div>Would you like to delete the item: {item}?</div>
<Button text="Delete" on:click={() => onDel(item)} />
