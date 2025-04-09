import MessageContentSticker from './components/MessageContentSticker/MessageContentSticker.svelte';
import MessageContentGif from './components/MessageContentGif/MessageContentGif.svelte';
import MessageContentEmoji from './components/MessageContentEmoji/MessageContentEmoji.svelte';
import MessageContentAttachment from './components/MessageContentFile/MessageContentAttachment.svelte';
import MessageContentImage from './components/MessageContentImage/MessageContentImage.svelte';
import MessageContentVideo from './components/MessageContentVideo/MessageContentVideo.svelte';
import MessageContentAudio from './components/MessageContentAudio/MessageContentAudio.svelte';
import FilesWrapper from './components/MessageContentFile/FilesWrapper.svelte';
import ImagesWrapper from './components/MessageContentImage/ImagesWrapper.svelte';
import VideosWrapper from './components/MessageContentVideo/VideosWrapper.svelte';
import AudioWrapper from './components/MessageContentAudio/AudioWrapper.svelte';
import MessageContentReply from './components/MessageContentReply/MessageContentReply.svelte';

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
