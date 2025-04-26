<script lang="ts">
 import 'videojs-record/dist/css/videojs.record.css';
 import Spinner from '@/core/components/Spinner/Spinner.svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';
 import Select from '@/core/components/Select/Select.svelte';
 import SelectOption from '@/core/components/Select/SelectOption.svelte';
 import Button from '@/core/components/Button/Button.svelte';
 import { identifier } from '@/org.libersoft.messages/messages';
 import { debug } from '@/core/core';
 import ButtonWithMenu from '@/core/components/Button/ButtonWithMenu.svelte';

 interface Props {
  width: string;
  height: string;
  loading?: boolean;
  error?: boolean;
  errorMessages?: string[] | null;
  videoRef?: HTMLVideoElement | null;
  micIndicatorRef?: HTMLElement | null;
  audioDevices?: InputDeviceInfo[];
  videoDevices?: InputDeviceInfo[];
  selectedAudioDeviceId?: string | null;
  selectedVideoDeviceId?: string | null;
  changeVideoInput?: (deviceId: string) => void;
  changeAudioInput?: (deviceId: string) => void;
 }

 let {
  // base
  width,
  height,
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
  changeVideoInput,
  changeAudioInput,
  send,
  download,
  isMuted,
  toggleMute,
  facingMode,
  toggleFacingMode,

  // player outer state
  loading = true,
  error = false,
  errorMessages = null,
  isRecording,
  hasData,
 }: Props = $props();
</script>

<style>
 .mic-button-wrapper {
  position: relative;
 }

 .mic-button-indicator {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: red;
  top: 6px;
  right: 6px;
  opacity: 0.4;
 }

 .video-recorder-debug {
  margin-top: 8px;
 }

 .device-select {
  flex: 1 1 auto;
 }

 .video-recorder :global(.video-js) {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
 }

 .video-recorder-footer {
  --gap: 4px;
  display: flex;
  gap: var(--gap);
  justify-content: space-between;
  margin-top: 8px;
 }

 .video-recorder-actions-left {
  display: flex;
  gap: var(--gap);
 }

 .video-recorder-actions-right {
  display: flex;
  gap: var(--gap);
 }

 .video-recorder {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
 }

 .video-recorder:not(.toggle-facing-mode-enabled) .camera-button-wrapper :global(.base-button) {
  cursor: default;
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
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
 }
</style>

{#snippet renderDevicesSelect(devices, selectedDeviceId, onChange)}
 <div class="device-select">
  <Select value={selectedDeviceId} onchange={onChange}>
   {#each devices as device (device.deviceId)}
    <SelectOption value={device.deviceId} selected={device.deviceId === selectedDeviceId} text={device.label} />
   {/each}
  </Select>
 </div>
{/snippet}

<div class="video-recorder" class:is-recording={isRecording} class:is-muted={isMuted} class:toggle-facing-mode-enabled={enableToggleFacingMode}>
 <div bind:this={videoRef} class="video-recorder-video-placeholder">
  {#if error}
   <div class="video-recorder-error">
    <Icon img="img/close.svg" alt="Error icon" colorVariable="--icon-yellow" size={30} padding={15} />
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
 </div>
 {#if $debug}
  <div class="video-recorder-debug">
   isRecording: {isRecording}; loading: {loading}; facingMode: {facingMode}
  </div>
 {/if}
 <div class="video-recorder-footer">
  <div class="video-recorder-actions-left">
   <!--<Button img="modules/{identifier}/img/download.svg" enabled={hasData} colorVariable="--icon-black" onClick={download} />-->
   <ButtonWithMenu>
    <Icon slot="side-button" img="img/caret-up.svg" alt="Error icon" colorVariable="--icon-black" size={16} padding={6} onClick={() => {}} />
    <div slot="main-button" class="mic-button-wrapper">
     <div bind:this={micIndicatorRef} class="mic-button-indicator"></div>

     {#if isMuted}
      <Button img="modules/{identifier}/img/mic-disabled.svg" colorVariable="--icon-gray" onClick={toggleMute} />
     {:else if isRecording}
      <Button img="modules/{identifier}/img/mic.svg" colorVariable="--icon-red" onClick={toggleMute} />
     {:else}
      <Button img="modules/{identifier}/img/mic.svg" colorVariable="--icon-black" onClick={toggleMute} />
     {/if}
    </div>
    <div slot="tooltip">
     {@render renderDevicesSelect(audioDevices, selectedAudioDeviceId, e => changeAudioInput(e.target.value))}
    </div>
   </ButtonWithMenu>
   <ButtonWithMenu>
    <Icon slot="side-button" img="img/caret-up.svg" alt="Error icon" colorVariable="--icon-black" size={16} padding={6} onClick={() => {}} />
    <div slot="main-button">
     <div class="camera-button-wrapper">
      {#if enableToggleFacingMode}
       <Button img="modules/{identifier}/img/camera-rotate.svg" colorVariable="--icon-black" onClick={toggleFacingMode} />
      {:else}
       <Button img="modules/{identifier}/img/camera.svg" colorVariable="--icon-black" onClick={() => {}} />
      {/if}
     </div>
    </div>
    <div slot="tooltip">
     {@render renderDevicesSelect(videoDevices, selectedVideoDeviceId, e => changeVideoInput(e.target.value))}
    </div>
   </ButtonWithMenu>
  </div>
  <div class="video-recorder-actions-right">
   {#if isRecording}
    <Button img="modules/{identifier}/img/stop.svg" colorVariable="--icon-black" text="STOP" onClick={recordStop} />
   {:else}
    <Button img="modules/{identifier}/img/record.svg" colorVariable="--icon-red" text="REC" onClick={recordStart} />
   {/if}
   <Button loading={sending} img="modules/{identifier}/img/send.svg" enabled={hasData || isRecording || sending} colorVariable="--icon-black" onClick={send} />
  </div>
 </div>
</div>
