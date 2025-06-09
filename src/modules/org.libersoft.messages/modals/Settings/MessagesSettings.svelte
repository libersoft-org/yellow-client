<script>
	import { get } from 'svelte/store';
	import { open } from '@tauri-apps/plugin-dialog';
	import { TAURI } from '@/core/tauri.ts';
	import { humanSize } from '@/core/utils/fileUtils.js';
	import { uploadChunkSize, hideMessageTextInNotifications, defaultFileDownloadFolder, photoRadius } from '../../messages.js';
	import Button from '@/core/components/Button/Button.svelte';
	import Switch from '@/core/components/Switch/Switch.svelte';
	import Select from '@/core/components/Select/Select.svelte';
	import Range from '@/core/components/Range/Range.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';
	let chunkSize = $uploadChunkSize;

	function onSetChunkSize(chunkSize) {
		if (get(uploadChunkSize) === chunkSize) {
			return;
		}
		uploadChunkSize.set(chunkSize);
	}

	$: onSetChunkSize(chunkSize);

	async function defaultFileDownloadFolderButtonClick() {
		const file = await open({
			directory: true,
			multiple: false,
			title: 'Select default file download folder',
		});
		if (file) {
			defaultFileDownloadFolder.set(file);
		}
	}
</script>

<style>
	.group {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	input[type='range'] {
		width: 100%;
	}
</style>

<div class="group">
	<div class="label">
		<span class="bold">File upload chunk size:</span>
		<span>{humanSize(chunkSize)}</span>
	</div>
	<Range data-testid="chunk-size" class="zoom" min="131072" max="31457280" step="131072" bind:value={chunkSize} />
</div>
<div class="group">
	<Switch bind:checked={$hideMessageTextInNotifications} showLabel label="Hide message text in notifications" orientation="vertical" />
</div>
<div class="group">
	<div class="label">
		<span class="bold">Photo radius:</span>
	</div>
	<Select bind:value={$photoRadius}>
		<Option value="50%" text="Circle" selected={true} />
		{#each Array(7) as _, i}
			<Option value="{i * 5}px" text="{i * 5} px" />
		{/each}
	</Select>
</div>
{#if TAURI}
	<div class="group">
		<div class="label">
			<span class="bold">Default file download folder (TODO)</span>
		</div>
		{$defaultFileDownloadFolder}<br />
		<span class="label">This is the folder where files will be downloaded by default.</span>
		<Button text="Change" onClick={defaultFileDownloadFolderButtonClick} />
	</div>
{/if}
