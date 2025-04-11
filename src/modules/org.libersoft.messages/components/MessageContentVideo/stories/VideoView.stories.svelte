<script lang="ts" module>
 import { defineMeta } from '@storybook/addon-svelte-csf';
 import VideoView from "@/org.libersoft.messages/components/MessageContentVideo/VideoView.svelte";

 // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
 const { Story } = defineMeta({
  title: 'messages/VideoView',
  component: VideoView,
  tags: ['autodocs'],
  args: {
   upload: null,
   download: null,
   thumbnailSrc: null,
   videoRef: null,
   startVideo: () => Promise.resolve(),
   onDownload: () => {},
   uploadId: 'test-upload-id',
   videoStarted: false,
   videoStarting: false,
   loadingData: false,
   fetchingPoster: false,
   posterError: false,
   videoIsFullDownloading: false,
  }
 });
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->

<Story
 name="Default"
 args={{

 }}
/>

<Story
 name="Loading data"
 args={{
  loadingData: true,
 }}
/>

<Story
 name="Loading poster"
 args={{
  upload: {
   record: {
    fileOriginalName: 'longer-name-of-this-video-file.mp4',
    fileSize: 1024 * 1024 * 64,
   }
  },
  loadingData: false,
  fetchingPoster: true,
 }}
/>

<Story
 name="Poster loaded (vertical)"
 args={{
  upload: {
   record: {
    fileOriginalName: 'longer-name-of-this-video-file.mp4',
    fileSize: 1024 * 1024 * 64,
   }
  },
  loadingData: false,
  fetchingPoster: false,
  thumbnailSrc: 'https://picsum.photos/200/300'
 }}
/>

<Story
 name="Poster loaded (horizontal)"
 args={{
  upload: {
   record: {
    fileOriginalName: 'longer-name-of-this-video-file.mp4',
    fileSize: 1024 * 1024 * 64,
   }
  },
  loadingData: false,
  fetchingPoster: false,
  thumbnailSrc: 'https://picsum.photos/300/200'
 }}
/>

<Story
 name="Poster loaded & starting (horizontal)"
 args={{
  upload: {
   record: {
    fileOriginalName: 'longer-name-of-this-video-file.mp4',
    fileSize: 1024 * 1024 * 64,
   }
  },
  loadingData: false,
  fetchingPoster: false,
  videoStarting: true,
  thumbnailSrc: 'https://picsum.photos/300/200'
 }}
/>

<Story
 name="Poster loading error (horizontal)"
 args={{
  upload: {
   record: {
    fileOriginalName: 'longer-name-of-this-video-file.mp4',
    fileSize: 1024 * 1024 * 64,
   }
  },
  loadingData: false,
  fetchingPoster: false,
  videoStarting: false,
  posterError: true,
 }}
/>

<!--
<Story
 name="Begun"
 args={{
  upload: FileViewStoriesUtils.makeServerSenderUpload({
   record: {
    status: FileUploadRecordStatus.BEGUN,
   },
  }),
 }}
/>
-->
