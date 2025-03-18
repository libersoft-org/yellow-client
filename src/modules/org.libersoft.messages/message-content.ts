import MessageContentSticker from './components/message-content-sticker.svelte';
import MessageContentGif from './components/message-content-gif.svelte';
import MessageContentEmoji from './components/message-content-emoji.svelte';
import MessageContentAttachment from './components/msgAttachment/message-content-attachment.svelte';
import MessageContentImage from './components/msgImage/message-content-image.svelte';
import MessageContentVideo from './components/msgVideo/message-content-video.svelte';
import MessageContentAudio from './components/msgAudio/message-content-audio.svelte';
import AttachmentsWrapper from './components/msgAttachment/attachments-wrapper.svelte';
import ImagesWrapper from './components/msgImage/images-wrapper.svelte';
import VideosWrapper from './components/msgVideo/videos-wrapper.svelte';
import AudioWrapper from './components/msgAudio/audio-wrapper.svelte';

export let componentMap = {
 sticker: MessageContentSticker,
 gif: MessageContentGif,
 emoji: MessageContentEmoji,
 attachment: MessageContentAttachment,
 attachmentswrapper: AttachmentsWrapper,
 imageswrapper: ImagesWrapper,
 imaged: MessageContentImage,
 yellowvideo: MessageContentVideo,
 videoswrapper: VideosWrapper,
 yellowaudio: MessageContentAudio,
 audiowrapper: AudioWrapper,
};
