<script>
 //let url = 'https://yellow-module1.netlify.app/'
 let url = 'http://localhost:5173/';

 let iframe;

 // Listener in the parent window to relay messages between iframes
 window.addEventListener('message', event => {
  //if (event.origin !== window.location.origin) return; // Validate origin
  iframe?.contentWindow.postMessage({ response: 'pong from parent', data: event.data }, '*'); //iframe.contentWindow.location.origin);
 });
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
