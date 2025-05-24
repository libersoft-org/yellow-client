<script>
 import Button from '../components/Button/Button.svelte';
 import Code from '../components/Code/Code.svelte';
 import { accounts_config } from '../core.js';
 import ButtonBar from '../components/Button/ButtonBar.svelte';

 function clickCopy(e) {
  console.log('clickCopy', e);
  navigator.clipboard.writeText(JSON.stringify($accounts_config, null, 2));
 }

 function clickDownload(e) {
  console.log('clickDownload', e);
  let blob = new Blob([JSON.stringify($accounts_config, null, 2)], {
   type: 'application/json',
  });
  console.log('blob', blob);
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

<ButtonBar>
 <Button img="img/copy.svg" text="Copy to clipboard" onClick={clickCopy} />
 <Button img="img/download.svg" text="Download as file" onClick={clickDownload} />
</ButtonBar>

<Code code={JSON.stringify($accounts_config, null, 2)} />
