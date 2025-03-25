<script lang="ts" module>
 import { defineMeta } from '@storybook/addon-svelte-csf';
 import {  } from '@storybook/svelte';
 import FileView from '../FileView.svelte';
 import {
  FileUploadRecordErrorType,
  FileUploadRecordStatus,
  FileUploadRole
 } from "@/org.libersoft.messages/fileUpload/types.ts";
 import FileViewStoriesUtils from "@/org.libersoft.messages/components/msgFile/stories/fileView.storiesUtils.ts";


 // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
 const {Story} = defineMeta({
  title: 'messages/FileView/P2PSender',
  component: FileView,
  tags: ['autodocs'],
  ...FileViewStoriesUtils.makeDefaultStoryArgs(),
 })

 const errors = [1, 2, 3]
</script>
<script>
 import { FileUploadRecordType } from "@/org.libersoft.messages/fileUpload/types.ts";
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story
 name="Begun"
 args={{
  upload: FileViewStoriesUtils.makeP2PSenderUpload({
   record: {
    status: FileUploadRecordStatus.BEGUN
   }
  })
 }}
/>

<Story
 name="Uploading"
 args={{
  upload: FileViewStoriesUtils.makeP2PSenderUpload({
   record: {
    status: FileUploadRecordStatus.UPLOADING
   },
   chunksSent: [1, 2, 3]
  })
 }}
/>

<Story
 name="Finished"
 args={{
  upload: FileViewStoriesUtils.makeP2PSenderUpload({
   record: {
    status: FileUploadRecordStatus.FINISHED
   }
  })
 }}
/>

<Story
 name="Error"
 args={{
  upload: FileViewStoriesUtils.makeP2PSenderUpload({
   record: {
    status: FileUploadRecordStatus.ERROR,
    errorType: null
   }
  })
 }}
/>

<Story
 name="Error/TIMEOUT_BY_SERVER"
 args={{
  upload: FileViewStoriesUtils.makeP2PSenderUpload({
   record: {
    status: FileUploadRecordStatus.ERROR,
    errorType: FileUploadRecordErrorType.TIMEOUT_BY_SERVER
   },
   chunksSent: [1, 2, 3]
  })
 }}
/>

<Story
 name="Paused"
 args={{
  upload: FileViewStoriesUtils.makeP2PSenderUpload({
   record: {
    type: FileUploadRecordType.P2P,
    status: FileUploadRecordStatus.PAUSED
   }
  })
 }}
/>

<Story
 name="Canceled"
 args={{
  upload: FileViewStoriesUtils.makeP2PSenderUpload({
   record: {
    type: FileUploadRecordType.P2P,
    status: FileUploadRecordStatus.CANCELED
   }
  })
 }}
/>

