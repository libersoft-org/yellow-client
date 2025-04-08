<script lang="ts" module>
 import { defineMeta } from '@storybook/addon-svelte-csf';
 import FileView from '../FileView.svelte';
 import { FileUploadRecordErrorType, FileUploadRecordStatus, FileUploadRole } from '@/org.libersoft.messages/services/Files/types.ts';
 import FileViewStoriesUtils from '@/org.libersoft.messages/components/MessageContentFile/stories/fileView.storiesUtils.ts';

 // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
 const { Story } = defineMeta({
  title: 'messages/FileView/ServerSender',
  component: FileView,
  tags: ['autodocs'],
  ...FileViewStoriesUtils.makeDefaultStoryArgs(),
 });
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
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

<Story
 name="Uploading"
 args={{
  upload: FileViewStoriesUtils.makeServerSenderUpload({
   record: {
    status: FileUploadRecordStatus.UPLOADING,
   },
   chunksSent: [1, 2, 3],
  }),
 }}
/>

<Story
 name="Finished"
 args={{
  upload: FileViewStoriesUtils.makeServerSenderUpload({
   record: {
    status: FileUploadRecordStatus.FINISHED,
   },
  }),
 }}
/>

<Story
 name="Error"
 args={{
  upload: FileViewStoriesUtils.makeServerSenderUpload({
   record: {
    status: FileUploadRecordStatus.ERROR,
    errorType: null,
   },
  }),
 }}
/>

<Story
 name="Error/TIMEOUT_BY_SERVER"
 args={{
  upload: FileViewStoriesUtils.makeServerSenderUpload({
   record: {
    status: FileUploadRecordStatus.ERROR,
    errorType: FileUploadRecordErrorType.TIMEOUT_BY_SERVER,
   },
  }),
 }}
/>

<Story
 name="Paused"
 args={{
  upload: FileViewStoriesUtils.makeServerSenderUpload({
   record: {
    status: FileUploadRecordStatus.PAUSED,
   },
   chunksSent: [1, 2, 3],
  }),
 }}
/>

<Story
 name="Canceled"
 args={{
  upload: FileViewStoriesUtils.makeServerSenderUpload({
   record: {
    status: FileUploadRecordStatus.CANCELED,
   },
  }),
 }}
/>
