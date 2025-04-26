<script lang="ts" module>
 import { defineMeta } from '@storybook/addon-svelte-csf';
 import VideoRecorderView from '@/org.libersoft.messages/components/VideoRecorder/VideoRecorderView.svelte';
 import { fn } from '@storybook/test';

 const makeAudioDevice = (id: string, label: string) =>
  ({
   deviceId: id,
   groupId: 'group-a',
   kind: 'audioinput',
   label,
  }) as InputDeviceInfo;

 const makeVideoDevice = (id: string, label: string) =>
  ({
   deviceId: id,
   groupId: 'group-b',
   kind: 'videoinput',
   label,
  }) as InputDeviceInfo;

 // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
 const { Story } = defineMeta({
  title: 'messages/VideoRecorder/View',
  component: VideoRecorderView,
  tags: ['autodocs'],
  args: {
   width: '600px',
   height: '400px',
   loading: false,
   error: false,
   errorMessages: null,
   videoRef: null,

   audioDevices: [makeAudioDevice('a', 'Audio device MIC'), makeAudioDevice('b', 'Audio device 2'), makeAudioDevice('c', 'Audio device 3')],
   videoDevices: [makeVideoDevice('a', 'Video device 1'), makeVideoDevice('b', 'Video device 2'), makeVideoDevice('c', 'Video device 3')],
   selectAudioDeviceId: 'a',
   selectVideoDeviceId: 'b',

   onRec: fn(),
   onDelete: fn(),
  },
 });
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story
 name="Loading"
 args={{
  loading: true,
 }}
/>

<Story
 name="Error generic"
 args={{
  error: true,
 }}
/>

<Story
 name="Error one message"
 args={{
  error: true,
  errorMessages: ['Special error message'],
 }}
/>

<Story
 name="Error multiple messages"
 args={{
  error: true,
  errorMessages: ['Special error message', 'Second Special and quire longer error message', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'],
 }}
/>
