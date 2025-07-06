<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { initUpload, selectedConversation } from '@/org.libersoft.messages/messages.js';
	import { FileUploadRecordType } from '@/org.libersoft.messages/services/Files/types.ts';
	import { assembleFile } from '@/org.libersoft.messages/services/Files/utils.ts';
	import 'videojs-record/dist/css/videojs.record.css';
	import videoJS from 'video.js';
	import 'videojs-record/dist/videojs.record.js';
	import 'recordrtc';
	import VideoRecorderView from '@/org.libersoft.messages/components/VideoRecorder/VideoRecorderView.svelte';
	import useVideoRecorder from '@/org.libersoft.messages/components/VideoRecorder/useVideoRecorder.svelte.ts';
	import { setupMicPulseIndicator } from '@/org.libersoft.messages/components/VideoRecorder/videoRecorderUtils.ts';
	let videoRef = $state<HTMLVideoElement>();
	let micIndicatorRef = $state<HTMLElement>();
	let sending = $state(false);
	let playerInstance: ReturnType<typeof videoJS> | null = null;

	const { setup, loading, error, errorMessages, videoDevices, audioDevices, selectedVideoDeviceId, selectedAudioDeviceId, changeVideoInput, changeAudioInput, player, recordedBlob, toggleMute, isMuted, facingMode, toggleFacingMode, userDeviceId, environmentDeviceId } = useVideoRecorder(() => videoRef, {
		controls: false,
		bigPlayButton: false,
		fill: true,
		plugins: {
			record: {
				audio: true,
				video: true,
				maxLength: Infinity,
				debug: true,
			},
		},
	});

	const enableToggleFacingMode = $derived(Boolean($userDeviceId && $environmentDeviceId && $userDeviceId !== $environmentDeviceId));
	let isRecording = $state(false);

	const start = () => {
		if (playerInstance) {
			playerInstance.dispose();
			$player.show();
		}

		const record = $player.record();

		record.start();
		isRecording = true;
	};

	const restart = () => {
		if (playerInstance) {
			playerInstance.dispose();
			playerInstance = null;
			$player.show();
		}
		recordedBlob.set(null);
		$player.record().getDevice();
	};

	let manuallyStop = false;
	const stop = () => {
		const record = $player.record();
		record.stop();
		//record.stopDevice(); TODO: stop stream and then restart if needed by start method
		//record.reset();
		isRecording = false;
		manuallyStop = true;
	};

	let sendingRequested = false;
	const send = () => {
		sending = true;
		const record = $player.record();
		if (record.isRecording()) {
			sendingRequested = true;
			record.stop();
		} else {
			if (!$recordedBlob) {
				console.error('$recordedBlob is not set');
				return;
			}
			sendMessage($recordedBlob);
		}
	};

	const sendMessage = async (blob: Blob) => {
		sending = true;
		const recipientEmail = get(selectedConversation).address;
		initUpload([blob], FileUploadRecordType.SERVER, [recipientEmail]).finally(() => {
			sending = false;
			recordedBlob.set(null);
		});
	};

	const download = () => {
		if (!$recordedBlob) {
			console.error('$recordedBlob is not set');
			return;
		}
		assembleFile($recordedBlob);
	};

	const showPreview = () => {
		$player.hide();
		if (!$recordedBlob) {
			console.error('$recordedBlob is not set');
			return;
		}
		if (!videoRef) {
			console.error('videoRef is not set');
			return;
		}
		console.log('$recordedBlob', $recordedBlob);
		const videoEl = document.createElement('video');
		videoEl.src = URL.createObjectURL($recordedBlob);
		videoEl.className = 'video-js vjs-default-skin';
		videoEl.setAttribute('controls', 'true');
		videoEl.setAttribute('playsinline', 'true');
		videoEl.setAttribute('webkit-playsinline', 'true');
		videoRef.appendChild(videoEl);
		playerInstance = videoJS(videoEl, {
			controls: true,
			autoplay: false,
			muted: false,
			preload: 'auto',
			seekable: true,
			fill: true,
		});

		playerInstance.on('error', function () {
			if (!playerInstance) {
				console.error('playerInstance is not set');
				return;
			}
			const error = playerInstance.error();
			// this is hack for bug in safari where it fires MEDIA_ERR_NETWORK but video is playable
			if (error && error.code === 2) {
				console.log('Ignoring MEDIA_ERR_NETWORK during blob playback.');
				// @ts-ignore
				playerInstance.error(null); // let null be here despite TS complaining
			}
		});
	};

	const startRecorder = () => {
		if (playerInstance) {
			playerInstance.dispose();
			playerInstance = null;
		}
		setup().then(_player => {
			_player.on('deviceReady', () => {
				const stream = _player.record().stream;
				if (!micIndicatorRef) {
					console.error('micIndicatorRef is not set');
					return;
				}
				setupMicPulseIndicator(stream, micIndicatorRef);
			});
			_player.on('startRecord', () => {
				isRecording = true;
			});
			_player.on('stopRecord', () => {
				isRecording = false;
			});
			_player.on('finishRecord', function () {
				try {
					if (sendingRequested) {
						if (!$recordedBlob) {
							console.error('$recordedBlob is not set');
							return;
						}
						sendMessage($recordedBlob);
					}
					if (manuallyStop) showPreview();
				} catch (err) {
					console.error('Error while finishing record:', err);
				} finally {
					manuallyStop = false;
					sendingRequested = false;
				}
			});
		});
	};

	onMount(() => {
		startRecorder();
	});

	onDestroy(() => {
		console.log('VideoRecorderContainer onDestroy playerInstance:', playerInstance);
		if (playerInstance) {
			playerInstance.dispose();
			playerInstance = null;
		}
		$player?.dispose();
	});
</script>

<style>
	:global(.video-recorder-container) {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
	}
</style>

<!--
<Dialog data={{title: 'das'}} bind:this={test}>
 test
</Dialog>
<div onclick={onTest}>test</div>
-->
<div class="video-recorder-container">
	<VideoRecorderView bind:videoRef bind:micIndicatorRef {sending} error={$error} errorMessages={$errorMessages} loading={$loading} videoDevices={$videoDevices} audioDevices={$audioDevices} selectedAudioDeviceId={$selectedAudioDeviceId} selectedVideoDeviceId={$selectedVideoDeviceId} {changeVideoInput} {changeAudioInput} {isRecording} recordStart={start} recordStop={stop} {send} {download} isMuted={$isMuted} {toggleMute} hasData={Boolean($recordedBlob)} facingMode={$facingMode} {toggleFacingMode} {enableToggleFacingMode} recordRestart={restart} />
</div>
