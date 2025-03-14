<script>
 import Modal from './modal.svelte';
 import Button from './button.svelte';
 export let data;
 export let showDialog = false;
</script>

<Modal title={data.title} bind:show={showDialog}>
 <Button slot="footer" text="Close" onClick={() => (showDialog = false)} />
</Modal>
