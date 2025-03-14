<script>
 import Modal from './modal.svelte';
 import Button from './button.svelte';
 export let data;
 export let show = false;

 export function open() {
  show = true;
 }
 export function close() {
  show = false;
 }
</script>

<Modal title={data.title} bind:show>
 <Button slot="footer" text="Close" onClick={() => (show = false)} />
</Modal>
