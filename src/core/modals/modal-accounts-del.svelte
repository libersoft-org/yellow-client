<script>
 import Button from '../components/button.svelte';
 import { delAccount } from '../accounts_config.js';
 export let title = '';
 export let id = '';

 function clickDel() {
  console.log('clickDel');
  delAccount(id);
  show = false;
 }
</script>

<div>Would you like to delete the account "<span class="bold">{title}</span>" (id: <span class="bold">{id}</span>)?</div>
<Button text="Delete" on:click={clickDel} />
