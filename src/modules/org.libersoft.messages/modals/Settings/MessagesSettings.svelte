<script>
	import { get } from 'svelte/store';
	import { open } from '@tauri-apps/plugin-dialog';
	import { TAURI } from '@/core/tauri.ts';
	import { humanSize } from '@/core/utils/fileUtils.js';
	import { uploadChunkSize, hideMessageTextInNotifications, defaultFileDownloadFolder, messageListMaxWidth, messageListApplyMaxWidth, photoRadius } from '../../messages.js';
	import Label from '@/core/components/Label/Label.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Switch from '@/core/components/Switch/Switch.svelte';
	import Select from '@/core/components/Select/Select.svelte';
	import Range from '@/core/components/Range/Range.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';
	let chunkSize = $uploadChunkSize;

	function onSetChunkSize(chunkSize) {
		if (get(uploadChunkSize) === chunkSize) return;
		uploadChunkSize.set(chunkSize);
	}

	$: onSetChunkSize(chunkSize);

	async function defaultFileDownloadFolderButtonClick() {
		const file = await open({
			directory: true,
			multiple: false,
			title: 'Select default file download folder',
		});
		if (file) defaultFileDownloadFolder.set(file);
	}
</script>

<Label text="File upload chunk size">
	<div>{humanSize(chunkSize)}</div>
	<Range data-testid="chunk-size" class="zoom" min="131072" max="31457280" step="131072" bind:value={chunkSize} />
</Label>
<Switch bind:checked={$hideMessageTextInNotifications} showLabel label="Hide message text in notifications" orientation="vertical" />
<Switch bind:checked={$messageListApplyMaxWidth} showLabel label="Apply maximum width between messages" orientation="vertical" />
<Label text="Maximum width between messages in pixels">
	<Input bind:value={$messageListMaxWidth} />
</Label>
<Label text="Photo radius">
	<Select bind:value={$photoRadius}>
		<Option value="50%" text="Circle" selected={true} />
		{#each Array(7) as _, i}
			<Option value="{i * 5}px" text="{i * 5} px" />
		{/each}
	</Select>
</Label>
{#if TAURI}
	<Label text="Default file download folder (TODO)">
		<div>{$defaultFileDownloadFolder}</div>
		<div class="label">This is the folder where files will be downloaded by default.</div>
		<Button img="img/edit.svg" text="Change" onClick={defaultFileDownloadFolderButtonClick} />
	</Label>
{/if}
