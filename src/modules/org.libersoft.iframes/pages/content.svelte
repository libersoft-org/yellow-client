<!--
<script>
 let url = 'static/iframe.html';
</script>

<iframe sandbox="allow-scripts" src={url} title="content" width="600" height="400"></iframe>
<iframe sandbox="allow-scripts" src="https://koo5.github.io/" title="content" width="600" height="400"></iframe>
-->

<!--
  <iframe id="iframe1" src="iframe1.html" style="width: 45%; height: 200px;"></iframe>
  <iframe id="iframe2" src="iframe2.html" style="width: 45%; height: 200px;"></iframe>

  <script>
    // Listener in the parent window to relay messages between iframes
    window.addEventListener('message', (event) => {
      if (event.origin !== window.location.origin) return; // Validate origin

      const targetIframe = event.data.target === "iframe2"
        ? document.getElementById("iframe2").contentWindow
        : document.getElementById("iframe1").contentWindow;

      if (targetIframe) {
        targetIframe.postMessage(event.data.message, window.location.origin);
      }
    });
  </script>
-->
