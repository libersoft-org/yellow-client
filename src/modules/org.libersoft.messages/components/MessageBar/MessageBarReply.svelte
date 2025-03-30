<script lang="ts">
 import { truncateTextEnd } from '@/core/utils/text.utils';
 import Button from '@/core/components/button.svelte';
 import messageBarReplyStore, { ReplyToType } from '@/org.libersoft.messages/stores/MessageBarReply.store.ts';

 interface MessageBarReplyProps {
  name: string;
  replyToMessage: string;
  onClose: () => void;
 }

 let { name, replyToMessage, onClose }: MessageBarReplyProps = $props();
</script>

<style>
 .reply-wrap {
  display: flex;
  padding: 8px 10px 0 10px;
  color: white;
 }

 .reply-wrap-content {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
 }

 .reply-wrap-close {
  flex: 0 0 30px;
 }

 .reply-wrap-heading {
  font-size: 16px;
  margin-bottom: 4px;
 }

 .reply-wrap-message {
  font-size: 12px;
  text-overflow: ellipsis;
  overflow: hidden;
  color: #ababab;
 }
</style>

<div class="reply-wrap">
 <div class="reply-wrap-content">
  <div class="reply-wrap-heading">
   Replying to <strong>{name}</strong>
  </div>
  <div class="reply-wrap-message">
   {truncateTextEnd(replyToMessage, 70)}
  </div>
 </div>
 <div class="reply-wrap-close">
  <Button onClick={onClose} img="img/close.svg" bgColor="transparent" width="auto" />
 </div>
</div>
