<script lang="ts">
	import ProgressBar from '@/core/components/ProgressBar/ProgressBar.svelte';
	import { humanSize } from '@/core/scripts/utils/fileUtils.ts';
	import { onDestroy } from 'svelte';
	interface Props {
		file?: string;
		total?: number;
		uploaded?: number;
		status?: string;
		hideSpeed?: boolean;
	}
	let { file = '', total = 0, uploaded = 0, status = '', hideSpeed = false }: Props = $props();
	let lastUploaded = $state(0);
	let speed = $state(0);

	function updateSpeed(): void {
		const elapsed = 1; // Always 1 second interval
		const delta = uploaded - lastUploaded;
		speed = delta > 0 ? delta / elapsed : 0; // Set to 0 if no progress
		lastUploaded = uploaded;
	}

	const interval = setInterval(updateSpeed, 1000);

	let percent = $derived(total > 0 ? Math.round((uploaded / total) * 100) : 0);

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<style>
	.upload {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.text {
		display: flex;
	}

	.text .size {
		flex-grow: 1;
	}
</style>

<div class="upload">
	<div class="file">
		{#if status}<span class="bold">{status}</span>{/if}
		{#if !hideSpeed}<span class="speed">&nbsp;{humanSize(speed)}/s</span>{/if}
		{#if file}
			<span>{file}</span>
		{/if}
	</div>
	<ProgressBar color="#db0" moving value={percent} />
	<div class="text">
		<div class="size">{humanSize(uploaded, 2, true)} / {humanSize(total, 2, true)}</div>
		<div class="percent">{percent}%</div>
	</div>
</div>
