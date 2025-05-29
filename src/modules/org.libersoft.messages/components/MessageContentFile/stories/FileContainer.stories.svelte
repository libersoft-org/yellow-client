<script lang="ts" module>
 import { defineMeta } from '@storybook/addon-svelte-csf';
 // import FileView from '../FileView.svelte';
 // import { FileUploadRecordErrorType, FileUploadRecordStatus, FileUploadRole } from '@/org.libersoft.messages/services/Files/types.ts';
 // import FileViewStoriesUtils from '@/org.libersoft.messages/components/MessageContentFile/stories/fileView.storiesUtils.ts';
 import FileContainer from '@/org.libersoft.messages/components/MessageContentFile/FileContainer.svelte';

 // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
 const { Story } = defineMeta({
  title: 'messages/FileContainer',
  component: FileContainer,
  tags: ['autodocs'],
 });
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story
 name="Default"
 args={{ uploadId: 'test-upload-id' }}
 play={async () => {
  console.log('play lol');
 }}
/>
