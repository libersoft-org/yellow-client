<script lang="ts">
	import { identifier } from '@/org.libersoft.messages/scripts/messages.js';
	import { debug } from '@/core/scripts/stores.ts';
	import 'videojs-record/dist/css/videojs.record.css';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Select from '@/core/components/Select/Select.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	interface Props {
		// base
		videoRef?: HTMLElement;
		micIndicatorRef?: HTMLElement;
		sending?: boolean;
		// devices
		audioDevices?: InputDeviceInfo[];
		videoDevices?: InputDeviceInfo[];
		selectedAudioDeviceId?: string | null;
		selectedVideoDeviceId?: string | null;
		enableToggleFacingMode?: boolean;
		// methods
		recordStart: () => void;
		recordStop: () => void;
		recordRestart: () => void;
		changeVideoInput: (deviceId: string) => void;
		changeAudioInput: (deviceId: string) => void;
		send: () => void;
		download: () => void;
		toggleMute: () => void;
		toggleFacingMode: () => void;
		// player outer state
		loading?: boolean;
		error?: boolean;
		errorMessages?: string[] | null;
		isRecording: boolean;
		hasData: boolean;
		isMuted: boolean;
		facingMode: string;
	}

	let {
		// base
		videoRef = $bindable(),
		micIndicatorRef = $bindable(),
		sending = false,
		// devices
		audioDevices = [],
		videoDevices = [],
		selectedAudioDeviceId = undefined,
		selectedVideoDeviceId = undefined,
		enableToggleFacingMode = false,
		// methods
		recordStart,
		recordStop,
		recordRestart,
		changeVideoInput,
		changeAudioInput,
		send,
		download,
		toggleMute,
		toggleFacingMode,
		// player outer state
		loading = true,
		error = false,
		errorMessages = null,
		isRecording,
		hasData,
		isMuted,
		facingMode,
	}: Props = $props();
</script>

<style>
	.video-recorder-debug {
		margin-top: 8px;
	}

	.video-recorder :global(.video-js) {
		width: 100%;
		height: 100%;
		border-radius: 8px;
		overflow: hidden;
	}

	.devices {
		display: flex;
		gap: 10px;
	}

	.footer {
		--gap: 4px;
		display: flex;
		gap: var(--gap);
		justify-content: space-between;
		margin-top: 8px;
	}

	.video-recorder {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}

	.video-recorder-loading {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.video-recorder-error {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 4px;
	}

	.video-recorder-video-placeholder {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.video-floating-area-rt {
		z-index: 1;
		position: absolute;
		top: 8px;
		right: 8px;
		gap: 4px;
		display: flex;
	}
</style>

{#snippet renderDevicesSelect(devices, selectedDeviceId, onChange, type)}
	{@const disabled = !devices || devices.length === 0}
	{@const emptyMessage = loading ? 'Loading devices' : `No ${type} devices found`}
	<div>
		<Select value={!disabled ? selectedDeviceId : ''} onchange={onChange} enabled={!disabled}>
			{#if disabled}
				<Option value={''} disabled selected text={emptyMessage} />
			{/if}
			{#each devices as device (device.deviceId)}
				<Option value={device.deviceId} selected={device.deviceId === selectedDeviceId} text={device.label} />
			{/each}
		</Select>
	</div>
{/snippet}
<div class="video-recorder" class:is-recording={isRecording} class:is-muted={isMuted} class:toggle-facing-mode-enabled={enableToggleFacingMode}>
	<div bind:this={videoRef} class="video-recorder-video-placeholder">
		{#if error}
			<div class="video-recorder-error">
				<Icon img="img/cross.svg" alt="Error icon" colorVariable="--default-foreground" size="30px" padding="15px" />
				{#if errorMessages}
					{#each errorMessages as message}
						<div>{message}</div>
					{/each}
				{:else}
					<div>Something went wrong</div>
				{/if}
			</div>
		{:else if loading}
			<div class="video-recorder-loading">
				<Spinner />
				<div>Initializing recorder...</div>
			</div>
		{/if}
		<div class="video-floating-area-rt">
			{#if hasData && !isRecording}
				<Button img="img/download.svg" enabled={hasData} onClick={download} />
				<Button img="modules/{identifier}/img/delete.svg" enabled={hasData} onClick={recordRestart} />
			{/if}
		</div>
	</div>
	{#if $debug}
		<div class="video-recorder-debug">
			isRecording: {isRecording}; loading: {loading}; facingMode: {facingMode}
		</div>
	{/if}
	<div class="devices">
		{@render renderDevicesSelect(audioDevices, selectedAudioDeviceId, e => changeAudioInput(e.target.value), 'audio')}
		{@render renderDevicesSelect(videoDevices, selectedVideoDeviceId, e => changeVideoInput(e.target.value), 'video')}
	</div>
	<div class="footer">
		<ButtonBar equalize>
			<Button img="modules/{identifier}/img/{isMuted ? 'mic-disabled.svg' : 'mic.svg'}" colorVariable={isMuted ? '--disabled-foreground"' : '--primary-foreground'} onClick={toggleMute} />
			{#if enableToggleFacingMode}
				<Button img="modules/{identifier}/img/camera-rotate.svg" onClick={toggleFacingMode} />
			{:else}
				<Button img="modules/{identifier}/img/camera.svg" onClick={() => {}} />
			{/if}
		</ButtonBar>
		<ButtonBar equalize align="right">
			{#if isRecording}
				<Button img="modules/{identifier}/img/pause.svg" onClick={recordStop} />
			{:else}
				<Button img="modules/{identifier}/img/record.svg" enabled={!loading} onClick={recordStart} />
			{/if}
			<Button img="modules/{identifier}/img/send.svg" enabled={hasData || isRecording || sending} loading={sending} right onClick={send} />
		</ButtonBar>
	</div>
</div>
