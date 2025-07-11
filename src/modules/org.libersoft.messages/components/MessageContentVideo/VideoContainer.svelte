<script lang="ts">
	import { onMount } from 'svelte';
	import { writable, get } from 'svelte/store';
	import { loadUploadData, makeDownloadChunkAsyncFn, identifier, downloadAttachmentsSerial } from '@/org.libersoft.messages/scripts/messages.js';
	import { active_account } from '@/core/scripts/core.ts';
	import { assembleFile, base64ToUint8Array } from '@/org.libersoft.messages/services/Files/utils.ts';
	import { humanSize } from '@/core/scripts/utils/fileUtils.js';
	import MediaService from '@/org.libersoft.messages/services/Media/MediaService.ts';
	import MediaUtils from '@/org.libersoft.messages/services/Media/MediaUtils.ts';
	import fileDownloadStore from '@/org.libersoft.messages/stores/FileDownloadStore.ts';
	import MessageContentAttachment from '@/org.libersoft.messages/components/MessageContentFile/MessageContentAttachment.svelte';
	import type { IFileDownload, IFileUpload, IFileUploadRecord } from '@/org.libersoft.messages/services/Files/types.ts';
	import { truncateText } from '@/core/scripts/utils/textUtils.js';
	import _debug from 'debug';
	import VideoView from '@/org.libersoft.messages/components/MessageContentVideo/VideoView.svelte';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import videoJS from 'video.js';
	const debug = _debug('libersoft:messages:components:MessageContentVideo:Video');
	let { uploadId } = $props();
	let videoRef = $state<HTMLVideoElement>();
	let thumbnailRef = null;
	let mediaHandler = $state<MediaService | null>(null);
	let upload = $state<IFileUpload | null>(null);
	let download = $state<IFileDownload | null>(null);
	fileDownloadStore.store.subscribe(() => (download = fileDownloadStore.get(uploadId) || null));
	let thumbnailSrc = $state<string | null>(null);
	//let videoUrl = $state<string | null>(null)
	let videoJSEnabled = true;
	let posterError = $state(false);
	let videoStarted = $state(false);
	let videoStarting = $state(false);
	let loadingData = $state(false);
	let fetchingPoster = $state(false);
	let videoIsFullDownloading = $state(false);
	let videoJsInstance = $state<ReturnType<typeof videoJS> | null>(null);

	function getFileChunkFactory(uploadId) {
		const fn = makeDownloadChunkAsyncFn(get(active_account));
		return params => fn({ uploadId, ...params });
	}

	function onDownload() {
		if (!upload) {
			debug('No upload data available');
			return;
		}
		downloadAttachmentsSerial([upload.record], download => {
			const blob = new Blob(download.chunksReceived, { type: download.record.fileMimeType });
			assembleFile(blob, download.record.fileOriginalName);
		});
	}

	const fullDownloadVideo = () => {
		if (!upload) {
			debug('No upload data available');
			return;
		}
		videoIsFullDownloading = true;
		downloadAttachmentsSerial([upload.record], download => {
			videoIsFullDownloading = false;
			const blob = new Blob(download.chunksReceived, { type: download.record.fileMimeType });
			startVideoJS(URL.createObjectURL(blob)).finally(() => {
				videoStarting = false;
				videoStarted = true;
				videoJsInstance && videoJsInstance.show();
			});
		});
	};

	async function startVideo() {
		debug('Starting video');
		if (!upload) {
			debug('No upload data available');
			return;
		}

		videoStarting = true;
		const acc = get(active_account);
		if (!acc) {
			console.warn('No active account available');
			return;
		}
		const progressiveUrl = MediaUtils.makeProgressiveDownloadUrl(acc.id, upload.record.id);
		//const progressiveUrl = 'http://localhost:3001/'
		debug('Progressive URL:', progressiveUrl);

		const progressiveDownloadAvailable = await MediaUtils.checkProgressiveDownloadAvailability(progressiveUrl);
		debug('Progressive download availability:', progressiveDownloadAvailable);

		if (progressiveDownloadAvailable) {
			try {
				const player = await startVideoJS(progressiveUrl);
				videoStarting = false;
				videoStarted = true;
				player.show();
			} catch (err) {
				if (videoJsInstance && videoJsInstance.error()) {
					console.error('Video.js error:', videoJsInstance.error());
					fullDownloadVideo();
				}
			}
		} else {
			fullDownloadVideo();
		}
	}

	const startVideoJS = (url: string): Promise<ReturnType<typeof videoJS>> => {
		return new Promise((resolve, reject) => {
			const videoEl = document.createElement('video');
			videoEl.src = url;
			videoEl.className = 'video-js vjs-default-skin';
			videoEl.setAttribute('controls', 'true');
			videoEl.setAttribute('preload', 'auto');
			videoEl.setAttribute('autoplay', 'true');
			videoEl.setAttribute('muted', 'true');

			if (!videoRef) {
				console.error('videoRef is not set');
				reject(new Error('videoRef is not set'));
				return;
			}

			videoRef.appendChild(videoEl);

			if (videoJsInstance) {
				videoRef.removeChild(videoJsInstance.el());
				videoJsInstance.dispose();
			}

			const player = videoJS(videoEl, {
				controls: true,
				autoplay: true,
				muted: false,
				preload: 'none',
				seekable: false,
				hidden: true,
				//width: 100,
				//height: 200,
				//fluid: true,
			});
			videoJsInstance = player;

			player.hide();

			player.on('canplay', () => {
				resolve(player);
			});

			player.on('error', err => {
				reject(err);
			});
		});
	};

	const fetchPosterDynamically = () => {
		fetchingPoster = true;
		const getFileChunk = getFileChunkFactory(uploadId);
		return getFileChunk({ offsetBytes: 0, chunkSize: 1024 * 512 }).then(firstChunk => {
			if (!upload) {
				debug('No upload data available');
				return;
			}
			MediaUtils.extractThumbnail(new Blob([firstChunk.chunk.data], { type: upload.record.fileMimeType }))
				.then(thumbnailBlob => {
					// set thumbnailBlob to img src
					thumbnailSrc = URL.createObjectURL(thumbnailBlob);
					// mediaHandler.player.poster(thumbnailSrc);
					// mediaHandler.player.width(140);
					// mediaHandler.player.height(280);
				})
				.catch(err => {
					posterError = true;
				})
				.finally(() => {
					fetchingPoster = false;
				});
		});
	};

	onMount(() => {
		loadingData = true;
		loadUploadData(uploadId)
			.then(async uploadData => {
				upload = uploadData;
				const { record } = uploadData;

				if (record.metadata && record.metadata.thumbnail) {
					const thumbnailUint8Array = await base64ToUint8Array(record.metadata.thumbnail);
					const thumbnailBlob = new Blob([thumbnailUint8Array]);
					thumbnailSrc = URL.createObjectURL(thumbnailBlob);
				} else {
					fetchPosterDynamically();
				}
			})
			.finally(() => {
				loadingData = false;
			});
	});
</script>

<VideoView {upload} {download} {thumbnailSrc} bind:videoRef {startVideo} {onDownload} {uploadId} {videoStarted} {videoStarting} {loadingData} {fetchingPoster} {posterError} {videoIsFullDownloading} />
