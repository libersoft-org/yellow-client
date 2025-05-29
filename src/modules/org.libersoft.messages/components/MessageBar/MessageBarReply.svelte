<script lang="ts">
  import { truncateTextEnd } from '@/core/utils/textUtils';
  import Icon from '@/core/components/Icon/Icon.svelte';

  interface MessageBarReplyProps {
    name: string;
    replyToMessage: string;
    onClose: () => void;
  }

  let { name, replyToMessage, onClose }: MessageBarReplyProps = $props();
</script>

<div class="reply-wrap">
  <div class="content">
    <div class="heading">
      Replying to <strong>{name}</strong>
    </div>
    <div class="message">
      {truncateTextEnd(replyToMessage, 70)}
    </div>
  </div>
  <div class="close">
    <Icon img="img/close.svg" alt="Close" colorVariable="--icon-white" onClick={onClose} size="24px" padding="0px" />
  </div>
</div>

<style>
  .reply-wrap {
    display: flex;
    align-items: center;
    padding: 8px 10px 0 10px;
    color: white;
  }

  .content {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
  }

  .content .heading {
    font-size: 16px;
    margin-bottom: 4px;
  }

  .content .message {
    font-size: 12px;
    text-overflow: ellipsis;
    overflow: hidden;
    color: #ababab;
  }

  .close {
    flex: 0 0 30px;
  }
</style>
