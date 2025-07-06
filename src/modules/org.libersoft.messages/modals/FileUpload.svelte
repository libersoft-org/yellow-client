<script lang="ts">
	import { getContext } from 'svelte';
	import { get, type Writable } from 'svelte/store';
	import { FileUploadRecordType } from '@/org.libersoft.messages/services/Files/types.ts';
	import { humanSize } from '@/core/scripts/utils/fileUtils.js';
	import { truncateText } from '@/core/scripts/utils/textUtils.js';
	import { selectedConversation, initUpload, identifier } from '@/org.libersoft.messages/scripts/messages.js';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	interface Props {
		params: {
			setFileUploadModal: (value: number) => void;
		};
		close?: () => void;
	}
	type FileUploadModalContext = {
		fileUploadModalFiles: Writable<File[]>;
	};
	const { params, close }: Props = $props();
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
		//console.log('Deleting file:', file);
		//console.log($fileUploadModalFiles);
		const index = $fileUploadModalFiles.indexOf(file);
		//console.log('File index:', index);
		if (index > -1) {
			$fileUploadModalFiles.splice(index, 1);
			$fileUploadModalFiles = $fileUploadModalFiles;
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

	.body .items-empty {
		padding: 50px;
		text-align: center;
		box-sizing: border-box;
		width: 100%;
		border: 1px dashed var(--default-foreground);
		border-radius: 10px;
		background-color: var(--primary-softer-background);
		color: var(--primary-foreground);
	}

	.drop-active .items-empty {
		background-color: var(--primary-background);
	}

	.drop-active .file-table {
		filter: brightness(0.7);
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
	<ButtonBar equalize space>
		<Button img="modules/{identifier}/img/file-add.svg" text="Add files" onClick={onFileAdd} />
		<Button img="img/del.svg" text="Remove all" enabled={$fileUploadModalFiles.length > 0} onClick={onDeleteAll} />
	</ButtonBar>
	<div class="body" ondragover={onDragOver} ondragleave={onDragLeave} ondrop={onDrop} role="region" aria-label="File drop zone">
		{#if !!$fileUploadModalFiles.length}
			<div class="items file-table">
				<Table breakpoint="0">
					<Thead>
						<TheadTr>
							<Th>File name</Th>
							<Th>Size</Th>
							<Th>Action</Th>
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
			<Clickable onClick={onFileAdd}>
				<div class="items-empty" role="none">Drag and drop your files here<br />or click here to add files.</div>
			</Clickable>
		{/if}
	</div>
	<ButtonBar equalize space>
		<Button img="img/upload.svg" text="Send peer-to-peer" onClick={uploadP2P} enabled={$fileUploadModalFiles.length > 0} data-testid="send-files-p2p" />
		<Button img="img/upload.svg" text="Send to server" onClick={uploadServer} enabled={$fileUploadModalFiles.length > 0} data-testid="send-files-server" />
	</ButtonBar>
</div>
