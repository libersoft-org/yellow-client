<script lang="ts">
	import { get } from 'svelte/store';
	import fileUploadStore from '@/org.libersoft.messages/stores/FileUploadStore.ts';
	import { extractYellowValue, isYellowProtocol } from '@/org.libersoft.messages/scripts/utils/yellowUtils.ts';
	import type { IFileUpload } from '@/org.libersoft.messages/services/Files/types.ts';

	let { children, node } = $props();
	const childrenLength = node?.childNodes.length || 0;
	let rowSize = 4;
	let rowLimit = 2;
	let hiddenImages: any[] = [];
	let siblings = $derived(children.map(child => child));
	let imagesRows = $derived.by(() => {
		let groups: any[][] = [];
		let group: any[] = [];
		children.forEach((child, index) => {
			if (!child.component) {
				console.info("Can't render child with no component", child);
				return;
			}
			// if rowLimit is reached and last row is full - add remaining images to hidden group
			if (groups.length === rowLimit && groups[groups.length - 1].length === rowSize) {
				hiddenImages.push(child);
				return;
			} else group.push(child);
			if (group.length === rowSize || index === children.length - 1) {
				groups.push(group);
				group = [];
			}
		});
		return groups;
	});

	const existingUploads = $derived.by(() => {
		const uploads = get(fileUploadStore.store);
		const existingUploads: IFileUpload[] = [];
		children.forEach(child => {
			const childUploadId = isYellowProtocol(child?.props?.file) ? extractYellowValue(child?.props?.file) : null;
			if (!childUploadId) return;
			const childUpload = uploads.find(upload => childUploadId === upload.record.id);
			if (childUpload) existingUploads.push(childUpload);
		});

		return existingUploads;
	});

	$inspect('existingUploads', existingUploads);
</script>

<style>
	.images-wrap {
		--images-gap: 4px;
	}

	.images {
		display: flex;
		gap: var(--images-gap);
		width: 100%;
	}

	.images :global(.message-content-image) {
		--image-size: min(120px, calc(60 * var(--messages-list-width) / 100 / 4 - var(--images-group-size) * var(--images-gap)));
		display: flex;
		flex: 1 1;
		max-width: var(--image-size);
		min-width: var(--image-size);
		/*width: 100%;*/
		/*height: 100%;*/
	}
	.images :global(.message-content-image img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: 50% 50%;
	}

	@container (max-width: 300px) {
	}
</style>

<div class="images-wrap" data-children-length={childrenLength} style="--images-group-size: {rowSize};" style:margin-bottom="var(--images-gap)">
	{#each imagesRows as row, rowIndex (rowIndex)}
		<div class="images" style:margin-bottom={rowIndex === imagesRows.length - 1 ? 0 : 'var(--images-gap)'}>
			{#each row as child, childIndex (child.tagUniqueId)}
				{@const isLastOfAll = rowIndex === rowLimit - 1 && childIndex === row.length - 1}
				{@debug child}
				<child.component {...child.props} showHiddenImages={isLastOfAll && hiddenImages.length > 0} {hiddenImages} {siblings} />
			{/each}
		</div>
	{/each}
	gdsfgdf
</div>
