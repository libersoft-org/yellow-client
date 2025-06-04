<script lang="ts">
	import VideoRecorderContainer from '@/org.libersoft.messages/components/VideoRecorder/VideoRecorderContainer.svelte';
	import { isMobile } from '@/core/stores.ts';
</script>

<style>
	.video-recorder-modal-body {
		width: 70vw;
		height: 50vh;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.video-recorder-modal-body.mobile {
		width: calc(100vw - 20px);
		height: 80vh;
	}
</style>

<div class="video-recorder-modal-body {$isMobile ? 'mobile' : ''}">
	<VideoRecorderContainer />
</div>
