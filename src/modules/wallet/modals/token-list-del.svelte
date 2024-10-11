<script>
 import Button from '../../../core/components/button.svelte';
 export let close;
 export let params;
 export let title = 'Delete token';
</script>

<style>
</style>

<div>Would you like to delete the item: {params.item.name}?</div>
<Button
 text="Delete"
 on:click={() => {
  params.onDel(params.item);
  close();
 }}
/>
