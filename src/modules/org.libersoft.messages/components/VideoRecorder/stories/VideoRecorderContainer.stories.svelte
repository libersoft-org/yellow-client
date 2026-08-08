<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	// import VideoRecorderView from '@/org.libersoft.messages/components/VideoRecorder/VideoRecorderView.svelte';
	import VideoRecorderContainer from '@/org.libersoft.messages/components/VideoRecorder/VideoRecorderContainer.svelte';

	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'messages/VideoRecorder/Container',
		component: VideoRecorderContainer,
		/* Excluded from the automated test run: it starts a video.js recorder against a real camera,
		 * which a headless browser has none of. It still renders in Storybook itself. */
		tags: ['autodocs', '!test'],
		args: {},
	});
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story name="Default" args={{}} />
