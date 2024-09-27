<script>
 import Button from '../components/button.svelte';
 import {delAccount} from '../accounts_config.js';

 export let title = '';
 export let id = '';
 export let onClose;

 function clickDel() {
  console.log('clickDel');
  delAccount(id);
  onClose();
 }
</script>

<div>Would you like to delete the account "<span class="bold">{title}</span>" (id: <span class="bold">{id}</span>)?</div>
<Button text="Delete" on:click={clickDel}/>
