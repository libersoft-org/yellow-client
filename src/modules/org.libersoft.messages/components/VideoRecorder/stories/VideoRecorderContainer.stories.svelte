<script lang="ts" module>
 import { defineMeta } from '@storybook/addon-svelte-csf';
 // import VideoRecorderView from '@/org.libersoft.messages/components/VideoRecorder/VideoRecorderView.svelte';
 import VideoRecorderContainer from '@/org.libersoft.messages/components/VideoRecorder/VideoRecorderContainer.svelte';

 // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
 const { Story } = defineMeta({
  title: 'messages/VideoRecorder/Container',
  component: VideoRecorderContainer,
  tags: ['autodocs'],
  args: {},
 });
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story name="Default" args={{}} />
