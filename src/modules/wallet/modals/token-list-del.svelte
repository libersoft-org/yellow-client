<script>
 import Button from '../../../core/components/button.svelte';
 export let item;

 function clickDel() {
  // TODO
 }
</script>

<style>
</style>

<div>Would you like to delete the item: {item}?</div>
<Button text="Add token" on:click={clickDel} />
