<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import VideoView from '@/org.libersoft.messages/components/MessageContentVideo/VideoView.svelte';
	import { FileUploadRecordStatus, FileUploadRecordType, FileUploadRole, type IFileUpload } from '@/org.libersoft.messages/services/Files/types.ts';

	/* A complete upload fixture. The stories used to pass `{ fileOriginalName, fileSize }` only, which
	 * does not satisfy IFileUploadRecord - svelte-check flags every one of them. */
	function makeUpload(fileOriginalName: string, fileSize: number): IFileUpload {
		return {
			role: FileUploadRole.RECEIVER,
			file: null,
			acc: null,
			/* Transfers are owned by an account; the stories run without one. */
			accountKey: 'storybook',
			chunksSent: [],
			uploadInterval: null,
			record: {
				id: 'test-upload-id',
				type: FileUploadRecordType.SERVER,
				status: FileUploadRecordStatus.FINISHED,
				errorType: null,
				fileOriginalName,
				fromUserUid: 'test-user',
				fileMimeType: 'video/mp4',
				fileSize,
				chunkSize: 64 * 1024,
				metadata: null,
			},
		};
	}

	const videoUpload = makeUpload('longer-name-of-this-video-file.mp4', 1024 * 1024 * 64);

	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'messages/VideoView',
		component: VideoView,
		tags: ['autodocs'],
		args: {
			upload: null,
			download: null,
			thumbnailSrc: null,
			videoRef: undefined,
			startVideo: () => Promise.resolve(),
			onDownload: () => {},
			uploadId: 'test-upload-id',
			videoStarted: false,
			videoStarting: false,
			loadingData: false,
			fetchingPoster: false,
			posterError: false,
			videoIsFullDownloading: false,
		},
	});
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->

<Story name="Default" args={{}} />

<Story
	name="Loading data"
	args={{
		loadingData: true,
	}}
/>

<Story
	name="Loading poster"
	args={{
		upload: videoUpload,
		loadingData: false,
		fetchingPoster: true,
	}}
/>

<Story
	name="Poster loaded (vertical)"
	args={{
		upload: videoUpload,
		loadingData: false,
		fetchingPoster: false,
		thumbnailSrc: 'https://picsum.photos/200/300',
	}}
/>

<Story
	name="Poster loaded (horizontal)"
	args={{
		upload: videoUpload,
		loadingData: false,
		fetchingPoster: false,
		thumbnailSrc: 'https://picsum.photos/300/200',
	}}
/>

<Story
	name="Poster loaded & starting (horizontal)"
	args={{
		upload: videoUpload,
		loadingData: false,
		fetchingPoster: false,
		videoStarting: true,
		thumbnailSrc: 'https://picsum.photos/300/200',
	}}
/>

<Story
	name="Poster loading error (horizontal)"
	args={{
		upload: videoUpload,
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
