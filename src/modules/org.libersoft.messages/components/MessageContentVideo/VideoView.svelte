<script lang="ts">
	import { humanSize } from '@/core/scripts/utils/fileUtils.js';
	import { identifier } from '@/org.libersoft.messages/scripts/messages.js';
	import { debug } from '@/core/scripts/stores.ts';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import MessageContentAttachment from '@/org.libersoft.messages/components/MessageContentFile/MessageContentAttachment.svelte';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	import type { IFileDownload, IFileUpload } from '@/org.libersoft.messages/services/Files/types.ts';
	import Skeleton from '@/core/components/Skeleton/Skeleton.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';

	interface Props {
		upload: IFileUpload | null;
		download: IFileDownload | null;
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
	.video-view {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.title {
		display: flex;
		gap: 5px;
	}

	.video-wrapper {
		max-width: min(330px, var(--video-size));
	}

	.video-placeholder {
		display: flex;
		width: 100%;
	}

	.video-placeholder .video-poster {
		width: auto;
		height: 100%;
		position: relative;
	}

	.video-placeholder .video-poster .image {
		height: 100%;
		width: auto;
		border-radius: 10px;
	}

	.video-placeholder .video-poster .play {
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

	.video-wrapper :global(.video-js) {
		height: 200px !important;
		width: 100%;
		height: auto;
		object-fit: contain;
	}
</style>

<div class="video-view">
	{#if $debug}
		<code>{JSON.stringify({ uploadId, videoStarted, videoStarting, loadingData, fetchingPoster, posterError, thumbnailSrc, download: download })}</code>
	{/if}
	{#if upload}
		<div class="title">
			<div class="bold">{upload.record.fileOriginalName}</div>
			<div>({humanSize(upload.record.fileSize)})</div>
		</div>
	{:else}
		<Skeleton width="100%" />
	{/if}
	<div class="video-wrapper" style:height={videoIsFullDownloading ? 'auto' : undefined}>
		<!--<video bind:this={videoRef} onclick={() => console.log('test')} class="video video-js vjs-default-skin" controls> </video>-->
		<!--<video src="https://dl11.webmfiles.org/big-buck-bunny_trailer.webm" class="video video-js vjs-default-skin" controls> </video>-->
		{#if loadingData || fetchingPoster}
			<Skeleton width="100%" height="100%" />
		{:else if upload && !videoStarted}
			<div class="video-placeholder">
				<div class="video-poster">
					{#if thumbnailSrc}
						<img class="image" src={thumbnailSrc} alt="Video poster" />
					{/if}
					{#if posterError}
						<div>Error loading poster</div>
					{/if}
					<Clickable onClick={startVideo}>
						<div class="play">
							{#if videoStarting}
								<Spinner show size="14px" containerMinHeight="14px" />
							{:else}
								<Icon img="modules/{identifier}/img/play.svg" colorVariable="--primary-background" alt="Start video" size="24px" padding="0px" />
							{/if}
						</div>
					</Clickable>
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
		<Button img="img/download.svg" onClick={onDownload} text="Download" />
	{:else}
		<MessageContentAttachment node={{ attributes: { id: { value: uploadId } } }} />
	{/if}
</div>
