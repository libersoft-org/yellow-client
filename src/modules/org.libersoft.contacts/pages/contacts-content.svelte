<script>
 import Dialog from '../../../core/components/dialog.svelte';
 let showDialog = true;
 const dialogData = {
  title: 'Dialog title',
 }
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
<Dialog data={dialogData} bind:show={showDialog} />
 <div>Contacts Dialog content</div>
</Dialog>
