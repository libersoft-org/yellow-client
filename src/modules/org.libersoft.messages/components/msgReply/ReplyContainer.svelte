<script lang="ts">
 import ReplyView from '@/org.libersoft.messages/components/msgReply/ReplyView.svelte';
 import { onMount } from 'svelte';
 import { getMessageByUid } from '@/org.libersoft.messages/messages';

 interface ReplyContainerProps {
  messageUid: string;
 }

 let { messageUid }: ReplyContainerProps = $props();
 let message = $state<any>(null);
 let loading = $state(false);

 onMount(() => {
  loading = true;
  getMessageByUid(messageUid)
   .then(repliedMessage => {
    message = repliedMessage;
   })
   .finally(() => {
    loading = false;
   });
 });
</script>

<ReplyView address={loading ? 'Reply' : message?.address_to} text={loading ? 'Loading' : message?.message} uid={messageUid} />
