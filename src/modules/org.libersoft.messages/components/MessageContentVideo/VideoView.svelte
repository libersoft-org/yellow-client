<script lang="ts">
	import { truncateText } from '@/core/utils/textUtils.js';
	import { humanSize } from '@/core/utils/fileUtils.js';
	import { identifier } from '@/org.libersoft.messages/messages.js';
	import { debug } from '@/core/stores.ts';
	import Button from '@/core/components/Button/Button.svelte';
	import MessageContentAttachment from '@/org.libersoft.messages/components/MessageContentFile/MessageContentAttachment.svelte';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	import type { FileDownload, FileUpload } from '@/org.libersoft.messages/services/Files/types.ts';
	import Skeleton from '@/core/components/Skeleton/Skeleton.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';

	interface Props {
		upload: FileUpload | null;
		download: FileDownload | null;
		thumbnailSrc: string | null;
		videoRef?: HTMLElement;
		startVideo: () => Promise<void>;
		onDownload: () => void;
		uploadId: string;
		videoStarted: boolean;
		videoStarting: boolean;
		loadingData: boolean;
		fetchingPoster: boolean;
		posterError: boolean;
		videoIsFullDownloading: boolean;
	}

	let { upload, download, thumbnailSrc, videoRef = $bindable(), startVideo, onDownload, uploadId, videoStarted, videoStarting, loadingData, fetchingPoster, posterError, videoIsFullDownloading }: Props = $props();
</script>

<style>
	.video-wrapper {
		max-width: min(330px, var(--video-size));
		height: 200px;
		width: 330px;
		margin-bottom: 8px;
	}

	.video-title {
		margin-bottom: 8px;
	}

	.video-placeholder {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
	}

	.video-placeholder-image {
		height: 100%;
		width: auto;
		border-radius: 10px;
	}

	.video-placeholder-play-button {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		border: none;
		cursor: pointer;

		width: 65px;
		height: 45px;
		background: #000000a6;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 6px;
	}

	.video-poster {
		width: auto;
		height: 100%;
		position: relative;
	}

	.video-wrapper :global(.video-js) {
		height: 200px !important;
		width: 100%;
		height: auto;
		object-fit: contain;
	}
</style>

<div>
	{#if $debug}
		<code>{JSON.stringify({ uploadId, videoStarted, videoStarting, loadingData, fetchingPoster, posterError, thumbnailSrc, download: download })}</code>
	{/if}
	<div class="video-title">
		{#if upload}
			<div>
				<strong title={upload.record.fileOriginalName}>{truncateText(upload.record.fileOriginalName, 25)}</strong>
				({humanSize(upload.record.fileSize)})
			</div>
		{:else}
			<Skeleton width="100%" />
		{/if}
	</div>
	<div class="video-wrapper" style:height={videoIsFullDownloading ? 'auto' : undefined}>
		<!--<video bind:this={videoRef} onclick={() => console.log('test')} class="video video-js vjs-default-skin" controls> </video>-->
		<!--<video src="https://dl11.webmfiles.org/big-buck-bunny_trailer.webm" class="video video-js vjs-default-skin" controls> </video>-->

		{#if loadingData || fetchingPoster}
			<Skeleton width="100%" height="100%" />
		{:else if upload && !videoStarted}
			<div class="video-placeholder">
				<div class="video-poster">
					{#if thumbnailSrc}
						<img class="video-placeholder-image" src={thumbnailSrc} alt="Video poster" />
					{/if}
					{#if posterError}
						<div>Error loading poster</div>
					{/if}

					<button class="video-placeholder-play-button button-reset" onclick={startVideo}>
						{#if videoStarting}
							<Spinner show={true} size="14px" containerMinHeight="14px" />
						{:else}
							<Icon img="modules/{identifier}/img/play.svg" colorVariable="--primary-background" alt="Start video" size="24px" padding="0px" />
						{/if}
					</button>
				</div>
			</div>
		{/if}
		{#if videoStarted}
			{#if videoIsFullDownloading}
				<div>This video can not be streamed in your browser therefore it must be downloaded first.</div>
			{/if}
		{/if}
		<div bind:this={videoRef} class="video"></div>
	</div>
	{#if !download}
		<div class="">
			<Button img="img/download.svg" onClick={onDownload} text="Download" />
		</div>
	{:else}
		<MessageContentAttachment node={{ attributes: { id: { value: uploadId } } }} />
	{/if}
</div>
