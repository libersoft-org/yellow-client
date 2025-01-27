<script>
 import Button from '../../../core/components/button.svelte';

 let { children, node } = $props();

 function onAcceptAll() {
  // find all classes message-attachment-accept-btn and perform click evt
  const acceptBtns = document.querySelectorAll('.message-attachment-accept-btn .base-button');
  acceptBtns.forEach(btn => btn.click());
 }
</script>

<style>
 .attachments-wrap {
  display: flex;
  flex-direction: column;
 }

 .attachments {
  margin-bottom: 16px;
 }

 :global(.message.outgoing .message-attachment-accept-btn) {
  display: flex;
  justify-content: right;
 }

 :global(.message.outgoing) .actions {
  display: flex;
  justify-content: right;
 }
</style>

<div class="attachments-wrap">
 <div class="attachments">
  {@render children?.()}
 </div>
 <div class="actions">
  <Button width="80px" text="Accept All" onClick={onAcceptAll} />
 </div>
</div>
