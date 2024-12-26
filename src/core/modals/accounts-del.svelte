<script>
 import Button from '../components/button.svelte';
 import { delAccount } from '../accounts_config.js';
 export let close;
 export let params;

 function clickDel() {
  console.log('clickDel');
  delAccount(params.id);
  close();
 }
</script>

<div>Would you like to delete the account "<span class="bold">{params.name}</span>" (id: <span class="bold">{params.id}</span>)?</div>
<Button text="Delete" onClick={clickDel} />
