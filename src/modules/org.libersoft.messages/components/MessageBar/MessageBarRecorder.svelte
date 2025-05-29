<script lang="ts">
	import { identifier, initUpload, selectedConversation } from '../../messages.js';
	import audioRecorderStore from '@/org.libersoft.messages/stores/AudioRecorderStore.ts';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import RecordPlugin from 'wavesurfer.js/plugins/record';
	import resize from '@/core/actions/resizeObserver.ts';
	import { get } from 'svelte/store';
	import { FileUploadRecordType } from '@/org.libersoft.messages/services/Files/types.ts';
	import MediaUtils from '@/org.libersoft.messages/services/Media/MediaUtils.ts';
	import WaveSurfer from 'wavesurfer.js';

	let wavesurferRef: HTMLElement;
	let wavesurfer: WaveSurfer;
	let wavesurferRecord: RecordPlugin;

	let isOpen = audioRecorderStore.isOpen();
	let isPaused = $state(false);
	let wavesurferWidth = $state(undefined);
	let sending = $state(false);

	const onResize = entry => {
		// We must explicitly set WaveSurfer's parent width; otherwise it causes flickering
		// (wavesurfer bug https://github.com/katspaugh/wavesurfer.js/issues/4055)
		wavesurferWidth = entry.contentRect.width;
	};

	const sendMessage = async blob => {
		const recipientEmail = get(selectedConversation).address;
		const arrBuffer = await blob.arrayBuffer();
		const audioMetaData = await MediaUtils.getAudioDataFromArrayBuffer(arrBuffer);
		blob.name = 'Audio record.webm';
		blob.metadata = audioMetaData;
		initUpload([blob], FileUploadRecordType.SERVER, [recipientEmail]);
		audioRecorderStore.setOpen(false);
	};

	const startRecording = async () => {
		isPaused = false;

		// @ts-ignore
		const permissions = await navigator.permissions.query({ name: 'microphone' });

		if (permissions.state === 'denied') {
			audioRecorderStore.setOpen(false);
			alert('Microphone access denied. Please check your browser settings.');
			return;
		}

		if (wavesurfer) {
			wavesurfer.destroy();
		}

		wavesurfer = WaveSurfer.create({
			container: wavesurferRef,
			waveColor: 'rgb(255 221 17)',
			progressColor: 'rgb(167,145,8)',
			height: 32,
			fillParent: true,
			hideScrollbar: true,
			autoScroll: true,
			autoCenter: true,
		});

		wavesurferRecord = wavesurfer.registerPlugin(
			RecordPlugin.create({
				renderRecordedAudio: false,
				scrollingWaveform: true,
				continuousWaveform: false,
				//continuousWaveformDuration: 30, // optional
				scrollingWaveformWindow: 4,
			})
		);

		wavesurferRecord.on('record-end', blob => {
			if (sending) {
				sending = false;
				sendMessage(blob);
			}
		});

		RecordPlugin.getAvailableAudioDevices().then(devices => {
			wavesurferRecord
				.startRecording({ deviceId: 'default' })
				.then(() => {
					console.log('startRecording');
				})
				.catch(err => {
					alert(err);
					audioRecorderStore.setOpen(false);
				});
		});
	};

	const onRecord = () => {
		isPaused = false;
		wavesurferRecord.resumeRecording();
	};

	const onPause = () => {
		isPaused = true;
		wavesurferRecord.pauseRecording();
	};

	const onDelete = () => {
		audioRecorderStore.setOpen(false);
		wavesurferRecord.destroy();
	};

	const onSend = () => {
		sending = true;
		wavesurferRecord.stopRecording();
	};

	$effect(() => {
		if ($isOpen) {
			startRecording();
		}
	});
</script>

<style>
	.message-bar-recorder {
		--border-radius: 8px;
		box-sizing: border-box;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: #222;
		align-items: center;
		gap: 8px;
		padding: 0 10px;
		z-index: 1;
	}

	.wavesurfer-wrap {
		flex: 1 1 100%;
		background: #404040;
		border-radius: var(--border-radius);
		padding: 0 10px;
		position: relative;
	}

	.wavesurfer {
		width: 100%;
	}

	.is-paused .wavesurfer {
		opacity: 0.3;
	}

	.button-wrapper :global(.base-button) {
		display: flex;
		justify-content: center;
		align-items: center;
		background: #404040;
		border-radius: var(--border-radius);
		width: 32px;
		height: 32px;
		flex: 1 0 auto;
	}
</style>

<div class="message-bar-recorder" class:is-paused={isPaused} style:display={$isOpen ? 'flex' : 'none'}>
	<div class="wavesurfer-wrap">
		<div bind:this={wavesurferRef} class="wavesurfer" use:resize={onResize} style:width={wavesurferWidth ? wavesurferWidth + 'px' : '100%'}></div>
	</div>
	<div class="button-wrapper">
		<Icon img="modules/{identifier}/img/delete.svg" colorVariable="--icon-red" alt="Delete" size="14px" padding="0px" onClick={onDelete} />
	</div>
	<div class="button-wrapper">
		{#if isPaused}
			<Icon img="modules/{identifier}/img/record.svg" colorVariable="--icon-red" alt="Record" size="14px" padding="0px" onClick={onRecord} />
		{:else}
			<Icon img="modules/{identifier}/img/pause.svg" colorVariable="--icon-yellow" alt="Stop" size="14px" padding="0px" onClick={onPause} />
		{/if}
	</div>
	<div style:poiner-events={sending ? 'none' : 'auto'} style:cursor={sending ? 'not-allowed' : 'pointer'}>
		<Icon img="modules/{identifier}/img/send.svg" alt="Send" size="32px" padding="0px" onClick={onSend} colorVariable="--icon-yellow" />
	</div>
</div>
