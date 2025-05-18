<script>
 import Button from '../components/Button/Button.svelte';
 import Code from '../components/Code/Code.svelte';
 import { accounts_config } from '../core.js';
 let text = '';

 function accountsConfigImport() {
  if (text) {
   let data = JSON.parse(text);
   accounts_config.set(data);
  }
 }
</script>

<Code bind:code={text} />
<Button img="img/import.svg" text="Import" onClick={accountsConfigImport} />
