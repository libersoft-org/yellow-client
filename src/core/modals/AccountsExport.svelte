<script>
 import Button from '../components/Button/Button.svelte';
 import Code from '../components/Code/Code.svelte';
 import { accounts_config } from '../core.js';
 import ButtonBar from '../components/Button/ButtonBar.svelte';

 let copyText = $state('Copy to clipboard');
 let timeoutId;

 function clickCopy() {
  navigator.clipboard.writeText(JSON.stringify($accounts_config, null, 2));
  copyText = 'Copied!';

  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
   copyText = 'Copy to clipboard';
  }, 2000);
 }

 function clickDownload() {
  let blob = new Blob([JSON.stringify($accounts_config, null, 2)], {
   type: 'application/json',
  });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = 'accounts_' + new Date().toISOString().replace('T', ' ').replace('Z', '').replace(/\.\d+/, '') + '.json';
  a.click();
  setTimeout(() => {
   URL?.revokeObjectURL(url);
   a?.remove();
  }, 100000);
 }
</script>

<style>
 .wrapper {
  border-radius: 10px;
  overflow: auto;
 }
</style>

<ButtonBar>
 <Button img="img/copy.svg" {copyText} text={copyText} onClick={clickCopy} />
 <Button img="img/download.svg" text="Download as file" onClick={clickDownload} />
</ButtonBar>

<div class="wrapper">
 <Code code={JSON.stringify($accounts_config, null, 2)} />
</div>
