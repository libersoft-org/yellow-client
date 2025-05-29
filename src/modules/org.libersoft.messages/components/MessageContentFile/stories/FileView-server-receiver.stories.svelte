<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FileView from '../FileView.svelte';
	import { FileUploadRecordErrorType, FileUploadRecordStatus } from '@/org.libersoft.messages/services/Files/types.ts';
	import FileViewStoriesUtils from '@/org.libersoft.messages/components/MessageContentFile/stories/fileView.storiesUtils.ts';

	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'messages/FileView/ServerReceiver',
		component: FileView,
		tags: ['autodocs'],
		...FileViewStoriesUtils.makeDefaultStoryArgs(),
	});
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<script lang="ts">
	const begunArgs = (() => {
		const upload = FileViewStoriesUtils.makeServerReceiverUpload({
			record: {
				status: FileUploadRecordStatus.BEGUN,
			},
		});
		return {
			upload,
			download: FileViewStoriesUtils.makeDownload({
				record: upload.record,
			}),
		};
	})();

	const uploadingArgs = (() => {
		const upload = FileViewStoriesUtils.makeServerReceiverUpload({
			record: {
				status: FileUploadRecordStatus.UPLOADING,
			},
		});
		return {
			upload,
			download: FileViewStoriesUtils.makeDownload({
				record: upload.record,
				chunksReceived: [1, 2, 3],
			}),
		};
	})();

	const finishedArgs = (() => {
		const upload = FileViewStoriesUtils.makeServerReceiverUpload({
			record: {
				status: FileUploadRecordStatus.FINISHED,
			},
		});
		return {
			upload,
			download: FileViewStoriesUtils.makeDownload({
				record: upload.record,
				chunksReceived: Array.from(
					{ length: Math.ceil(upload.record.fileSize / upload.record.chunkSize) },
					(_, i) => i
				),
			}),
		};
	})();

	const errorArgs = (() => {
		const upload = FileViewStoriesUtils.makeServerReceiverUpload({
			record: {
				status: FileUploadRecordStatus.ERROR,
			},
		});
		return {
			upload,
			download: null,
		};
	})();

	const errorTimeoutArgs = (() => {
		const upload = FileViewStoriesUtils.makeServerReceiverUpload({
			record: {
				status: FileUploadRecordStatus.ERROR,
				errorType: FileUploadRecordErrorType.TIMEOUT_BY_SERVER,
			},
		});
		return {
			upload,
			download: null,
		};
	})();

	const pausedLocallyArgs = (() => {
		const upload = FileViewStoriesUtils.makeServerReceiverUpload({
			record: {
				status: FileUploadRecordStatus.FINISHED,
			},
		});
		return {
			upload,
			download: FileViewStoriesUtils.makeDownload({
				record: upload.record,
				chunksReceived: [1, 2, 3],
				pausedLocally: true,
			}),
		};
	})();

	const canceledArgs = (() => {
		const upload = FileViewStoriesUtils.makeServerReceiverUpload({
			record: {
				status: FileUploadRecordStatus.CANCELED,
			},
		});
		return {
			upload,
			download: FileViewStoriesUtils.makeDownload({
				record: upload.record,
				chunksReceived: [1, 2, 3],
			}),
		};
	})();
</script>

<Story name="Begun" args={begunArgs} />

<Story name="Uploading" args={uploadingArgs} />

<Story name="Finished" args={finishedArgs} />

<Story name="Error" args={errorArgs} />

<Story name="Error/TIMEOUT_BY_SERVER" args={errorTimeoutArgs} />

<Story name="Paused locally" args={pausedLocallyArgs} />

<Story name="Canceled" args={canceledArgs} />
