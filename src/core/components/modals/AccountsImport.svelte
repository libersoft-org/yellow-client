<script>
 import Button from '@/core/components/Button/Button.svelte';
 import { accounts_config } from '../../core.js';
 let text = '';

 function accountsConfigImport() {
  if (text) {
   let data = JSON.parse(text);
   accounts_config.set(data);
  }
 }
</script>

<style>
 .json {
  border: 1px solid #888;
  border-radius: 10px;
  padding: 10px;
 }
</style>

<div class="label">Paste the account export in JSON format here:</div>
<textarea class="json" bind:value={text} rows="10" cols="50"></textarea>
<Button onClick={accountsConfigImport}>Import</Button>
