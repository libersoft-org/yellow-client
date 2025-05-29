<script lang="ts" module>
 import { defineMeta } from '@storybook/addon-svelte-csf';
 import FileView from '../FileView.svelte';
 import { FileUploadRecordErrorType, FileUploadRecordStatus } from '@/org.libersoft.messages/services/Files/types.ts';
 import FileViewStoriesUtils from '@/org.libersoft.messages/components/MessageContentFile/stories/fileView.storiesUtils.ts';

 // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
 const { Story } = defineMeta({
  title: 'messages/FileView/P2PReceiver',
  component: FileView,
  tags: ['autodocs'],
  ...FileViewStoriesUtils.makeDefaultStoryArgs(),
 });
</script>

<script>
 import { FileUploadRecordType } from '@/org.libersoft.messages/services/Files/types.ts';
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story
 name="Begun"
 args={{
  upload: FileViewStoriesUtils.makeP2PReceiverUpload({
   record: {
    status: FileUploadRecordStatus.BEGUN,
   },
  }),
  download: FileViewStoriesUtils.makeDownload({
   chunksReceived: [1, 2, 3],
  }),
 }}
/>

<Story
 name="Uploading"
 args={{
  upload: FileViewStoriesUtils.makeP2PReceiverUpload({
   record: {
    status: FileUploadRecordStatus.UPLOADING,
   },
   chunksSent: [1, 2, 3],
  }),
  download: FileViewStoriesUtils.makeDownload({
   chunksReceived: [1, 2, 3],
  }),
 }}
/>

<Story
 name="Finished"
 args={{
  upload: FileViewStoriesUtils.makeP2PReceiverUpload({
   record: {
    status: FileUploadRecordStatus.FINISHED,
   },
  }),
  download: FileViewStoriesUtils.makeDownload({
   chunksReceived: [1, 2, 3],
  }),
 }}
/>

<Story
 name="Error"
 args={{
  upload: FileViewStoriesUtils.makeP2PReceiverUpload({
   record: {
    status: FileUploadRecordStatus.ERROR,
    errorType: null,
   },
  }),
  download: FileViewStoriesUtils.makeDownload({
   chunksReceived: [1, 2, 3],
  }),
 }}
/>

<Story
 name="Error/TIMEOUT_BY_SERVER"
 args={{
  upload: FileViewStoriesUtils.makeP2PReceiverUpload({
   record: {
    status: FileUploadRecordStatus.ERROR,
    errorType: FileUploadRecordErrorType.TIMEOUT_BY_SERVER,
   },
  }),
  download: FileViewStoriesUtils.makeDownload({
   chunksReceived: [1, 2, 3],
  }),
 }}
/>

<Story
 name="Paused by receiver"
 args={{
  upload: FileViewStoriesUtils.makeP2PReceiverUpload({
   record: {
    type: FileUploadRecordType.P2P,
    status: FileUploadRecordStatus.UPLOADING,
   },
  }),
  download: FileViewStoriesUtils.makeDownload({
   chunksReceived: [1, 2, 3],
   pausedLocally: true,
  }),
 }}
/>

<Story
 name="Paused by sender"
 args={{
  upload: FileViewStoriesUtils.makeP2PReceiverUpload({
   record: {
    type: FileUploadRecordType.P2P,
    status: FileUploadRecordStatus.PAUSED,
   },
  }),
  download: FileViewStoriesUtils.makeDownload({
   chunksReceived: [1, 2, 3],
  }),
 }}
/>

<Story
 name="Canceled"
 args={{
  upload: FileViewStoriesUtils.makeP2PReceiverUpload({
   record: {
    type: FileUploadRecordType.P2P,
    status: FileUploadRecordStatus.CANCELED,
   },
  }),
  download: FileViewStoriesUtils.makeDownload({
   chunksReceived: [1, 2, 3],
  }),
 }}
/>
