import MessageContentSticker from './components/MessageContentSticker/MessageContentSticker.svelte';
import MessageContentGif from './components/MessageContentGif/MessageContentGif.svelte';
import MessageContentEmoji from './components/MessageContentEmoji/MessageContentEmoji.svelte';
import MessageContentAttachment from '@/org.libersoft.messages/components/MessageContentFile/MessageContentAttachment.svelte';
import MessageContentImage from '@/org.libersoft.messages/components/MessageContentImage/MessageContentImage.svelte';
import MessageContentVideo from '@/org.libersoft.messages/components/MessageContentVideo/MessageContentVideo.svelte';
import MessageContentAudio from '@/org.libersoft.messages/components/MessageContentAudio/MessageContentAudio.svelte';
import FilesWrapper from '@/org.libersoft.messages/components/MessageContentFile/FilesWrapper.svelte';
import ImagesWrapper from '@/org.libersoft.messages/components/MessageContentImage/ImagesWrapper.svelte';
import VideosWrapper from '@/org.libersoft.messages/components/MessageContentVideo/VideosWrapper.svelte';
import AudioWrapper from '@/org.libersoft.messages/components/MessageContentAudio/AudioWrapper.svelte';
import MessageContentReply from '@/org.libersoft.messages/components/MessageContentReply/MessageContentReply.svelte';

export let componentMap = {
 sticker: MessageContentSticker,
 gif: MessageContentGif,
 emoji: MessageContentEmoji,
 attachment: MessageContentAttachment,
 attachmentswrapper: FilesWrapper,
 imageswrapper: ImagesWrapper,
 imaged: MessageContentImage,
 yellowvideo: MessageContentVideo,
 videoswrapper: VideosWrapper,
 yellowaudio: MessageContentAudio,
 audiowrapper: AudioWrapper,
 reply: MessageContentReply,
};
