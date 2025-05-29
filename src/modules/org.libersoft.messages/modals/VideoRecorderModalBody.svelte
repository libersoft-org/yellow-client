<script lang="ts">
	import VideoRecorderContainer from '@/org.libersoft.messages/components/VideoRecorder/VideoRecorderContainer.svelte';
</script>

<style>
	.video-recorder-modal-body {
		width: 70vw;
		height: 50vh;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	@media (max-width: 768px) {
		.video-recorder-modal-body {
			width: calc(100vw - 20px);
			height: 80vh;
		}
	}
</style>

<div class="video-recorder-modal-body">
	<VideoRecorderContainer />
</div>
