<script>
 import Dialog from '../../../core/components/dialog.svelte';
 let showDialog = true;
</script>

<style>
 .content {
  height: 100vh;
  background: url('/img/background.webp') repeat;
  background-size: 400px;
  overflow: hidden;
 }
</style>

<div class="content">Contact list - content page - not yet implemented</div>
<Dialog data={{ title: 'Dialog title' }} bind:show={showDialog} />
