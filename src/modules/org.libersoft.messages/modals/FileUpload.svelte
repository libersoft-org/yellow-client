<script lang="ts">
	import { FileUploadRecordType } from '@/org.libersoft.messages/services/Files/types.ts';
	import { humanSize } from '@/core/utils/fileUtils.js';
	import { truncateText } from '@/core/utils/textUtils.js';
	import { get, type Writable } from 'svelte/store';
	import { getContext } from 'svelte';
	import { selectedConversation, initUpload } from '../messages.js';
	import Button from '@/core/components/Button/Button.svelte';
	import BaseButton from '@/core/components/BaseButton/BaseButton.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';

	type FileUploadModalContext = {
		fileUploadModalFiles: Writable<File[]>;
	};

	const { params } = $props();

	let elFileInput;
	let dropActive = $state(false);
	let { fileUploadModalFiles } = getContext<FileUploadModalContext>('FileUploadModal');

	function onFileAdd(e) {
		e && e.preventDefault();
		elFileInput.click();
	}

	function onDeleteAll() {
		$fileUploadModalFiles = [];
	}

	function onFileDelete(file) {
		const index = $fileUploadModalFiles.indexOf(file);
		if (index > -1) {
			$fileUploadModalFiles.splice(index, 1);
		}
	}

	function onFileUpload(e) {
		$fileUploadModalFiles = [...$fileUploadModalFiles, ...e.target.files];
		elFileInput.value = '';
	}

	const uploadServer = () => {
		const recipientEmail = get(selectedConversation).address;
		initUpload($fileUploadModalFiles, FileUploadRecordType.SERVER, [recipientEmail]);
		params.setFileUploadModal(0);
	};

	const uploadP2P = () => {
		const recipientEmail = get(selectedConversation).address;
		initUpload($fileUploadModalFiles, FileUploadRecordType.P2P, [recipientEmail]);
		params.setFileUploadModal(0);
	};

	function onDragOver(e) {
		e.preventDefault();
		dropActive = true;
	}

	function onDragLeave(e) {
		e.preventDefault();
		dropActive = false;
	}

	function onDrop(e) {
		e.preventDefault();
		dropActive = false;
		$fileUploadModalFiles = [...e.dataTransfer.files, ...$fileUploadModalFiles];
	}
</script>

<style>
	.file-upload {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.header {
		display: flex;
		gap: 10px;
		justify-content: space-between;
	}

	.body .items-empty {
		padding: 50px;
		text-align: center;
		background-color: var(--primary-softer-background);
		color: var(--primary-foreground);
		border: 1px dashed var(--default-foreground);
		border-radius: 10px;
		width: 100%;
	}

	.drop-active .items-empty {
		background-color: var(--primary-background);
	}

	.drop-active .file-table {
		filter: brightness(0.7);
	}

	.footer {
		display: flex;
		gap: 10px;
		justify-content: space-between;
	}
</style>

{#snippet fileUploadItem(file)}
	<TbodyTr>
		<Td title="File name">
			{truncateText(file.name, 30)}
		</Td>
		<Td title="Size">
			{humanSize(file.size)}
		</Td>
		<Td title="Action">
			<Icon img="img/del.svg" colorVariable="--primary-foreground" alt="Delete" size="20px" padding="5px" onClick={() => onFileDelete(file)} />
		</Td>
	</TbodyTr>
{/snippet}

<div class="file-upload {dropActive ? 'drop-active' : ''}">
	<input type="file" id="fileInput" bind:this={elFileInput} onchange={onFileUpload} multiple style="display: none;" data-testid="file-upload-input" />
	<div class="header">
		<Button img="img/add.svg" colorVariable="--primary-foreground" text="Add files" onClick={onFileAdd} />
		<Button img="img/del.svg" colorVariable="--primary-foreground" text="Remove all" enabled={$fileUploadModalFiles.length > 0} onClick={onDeleteAll} />
	</div>
	<div class="body" ondragover={onDragOver} ondragleave={onDragLeave} ondrop={onDrop} role="region" aria-label="File drop zone">
		{#if $fileUploadModalFiles.length}
			<div class="items file-table">
				<Table breakpoint="0">
					<Thead>
						<TheadTr>
							<Th>File name:</Th>
							<Th>Size:</Th>
							<Th>Action:</Th>
						</TheadTr>
					</Thead>
					<Tbody>
						{#each $fileUploadModalFiles as file}
							{@render fileUploadItem(file)}
						{/each}
					</Tbody>
				</Table>
			</div>
		{:else}
			<BaseButton onClick={onFileAdd}>
				<div class="items-empty" role="none">Drag and drop your files here<br />or click here to add files.</div>
			</BaseButton>
		{/if}
	</div>
	<div class="footer">
		<Button img="img/upload.svg" colorVariable="--primary-foreground" text="Send peer-to-peer" onClick={uploadP2P} enabled={$fileUploadModalFiles.length > 0} data-testid="send-files-p2p" />
		<Button img="img/upload.svg" colorVariable="--primary-foreground" text="Send to server" onClick={uploadServer} enabled={$fileUploadModalFiles.length > 0} data-testid="send-files-server" />
	</div>
</div>
