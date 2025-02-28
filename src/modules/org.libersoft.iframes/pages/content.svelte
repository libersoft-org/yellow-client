<script>
 import { accounts, findAccount, sendAsync } from '../../../core/core.js';

 //let url = 'https://yellow-module1.netlify.app/'
 let url = 'http://localhost:5173/';
 let module_id = 'org.libersoft.messages2';
 let iframe;

 // Listener in the parent window to relay messages between iframes
 window.addEventListener('message', async event => {
  //if (event.origin !== window.location.origin) return; // Validate origin
  if (event.origin !== 'null') return;
  if (event.source !== iframe.contentWindow) return;
  iframe?.contentWindow.postMessage(await processUserModuleMessage(event.data), '*');
  //iframe.contentWindow.location.origin);
 });

 async function processUserModuleMessage(data) {
  console.log('processUserModuleMessage: ', data);
  if (data.type === 'server_command') {
   return await serverCommand(data);
  } else if (data.type === 'list_accounts') {
   let res = [];
   for (let account of get(accounts)) {
    let acc = get(account);
    if (acc.modules_enabled.find(m => m === module_id) !== -1) {
     res.push(acc);
    }
   }
   return res;
  }
 }

 async function serverCommand(data) {
  console.log('serverCommand: ', data);
  let account = findAccount(data.account);
  if (!account) return { error: 'Account not found' };
  let acc = get(account);
  return await sendAsync(acc, null, module_id, data.command, data.params);
 }
</script>

<style>
 .parent {
  width: 100%;
  height: 100%;
  position: relative;
 }

 .parent iframe {
  width: 100%;
  height: 100%;
  border: none;
 }
</style>

<!--<h2>Iframe-isolated module test</h2>-->
<!--<iframe sandbox="allow-scripts" src={url} title="content" width="600" height="400"></iframe>-->
<!--<iframe sandbox="allow-scripts" src="https://koo5.github.io/" title="content" width="600" height="400"></iframe>-->
<!--<iframe id="iframe1" src="iframe1.html" style="width: 45%; height: 200px;"></iframe>-->
<!--<iframe id="iframe2" src="iframe2.html" style="width: 45%; height: 200px;"></iframe>-->

<div class="parent">
 <iframe bind:this={iframe} sandbox="allow-scripts" src={url} title="content"></iframe>
</div>
