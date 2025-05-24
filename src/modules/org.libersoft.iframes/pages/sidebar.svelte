<script>
 import core from '@/core/core.js';
 import Button from '@/core/components/Button/Button.svelte';

 let url = 'https://koo5.github.io/';
</script>

<Button text="hideSidebarMobile" onClick={() => core.hideSidebarMobile.set(true)} />

<iframe sandbox="allow-scripts" src={url} title="sidebar" style="border:none; height: 100%; x-scroll: none; width: 100%; overflow: hidden;"> </iframe>
