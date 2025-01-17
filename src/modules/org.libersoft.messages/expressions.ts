import MessageContentSticker from './components/message-content-sticker.svelte';
import MessageContentGif from './components/message-content-gif.svelte';
import MessageContentEmoji from './components/message-content-emoji.svelte';
import MessageContentAttachment from './components/message-content-attachment.svelte';

export let componentMap = {
 sticker: MessageContentSticker,
 gif: MessageContentGif,
 emoji: MessageContentEmoji,
 attachment: MessageContentAttachment,
};
