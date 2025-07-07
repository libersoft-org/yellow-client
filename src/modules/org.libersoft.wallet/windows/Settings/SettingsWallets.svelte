<script lang="ts">
	import { module } from '../../scripts/module.ts';
	import { wallets, type IWallet, reorderWallets } from '../../scripts/wallet.ts';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import TableActionItems from '@/core/components/Table/TableActionItems.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Window from '@/core/components/Window/Window.svelte';
	import WindowWalletsWallet from './SettingsWalletsWallet.svelte';
	import WindowRecover from '../Wallets/WalletsRecover.svelte';
	import WindowWalletsEdit from '../Wallets/WalletsEdit.svelte';
	import DialogWalletsDel from '../../dialogs/WalletsDel.svelte';
	import { getContext } from 'svelte';
	let selectedWallet: IWallet | undefined = $state();
	let elWindowWalletsWallet: Window | undefined;
	let elWindowRecover: Window | undefined;
	let elWindowWalletsEdit: Window | undefined;
	let elDialogWalletsDel: DialogWalletsDel | undefined = $state();
	const setSettingsSection = getContext<Function>('setSettingsSection');
	// Mouse-based drag & drop implementation
	let dragSourceIndex: number | null = null;
	let dragOverIndex: number | null = null;
	let isDragging = false;
	let dragElement: HTMLElement | null = null;
	let dragClone: HTMLElement | null = null;
	let isAtEnd = false; // Track if we're dragging to the end

	function clickWallet(wallet: IWallet) {
		setSettingsSection('wallets-' + wallet.address);
	}

	function delWallet(wallet: IWallet) {
		selectedWallet = wallet;
		elDialogWalletsDel?.open();
	}

	function editWallet(wallet: IWallet) {
		selectedWallet = wallet;
		elWindowWalletsEdit?.open();
	}

	function handleMouseDown(event: MouseEvent, index: number) {
		if (event.button !== 0) return; // Only left mouse button
		dragSourceIndex = index;
		isDragging = true;
		const target = event.currentTarget as HTMLElement;
		const row = target.closest('tr');
		if (row) {
			dragElement = row;
			// Create clone that follows mouse but stays within table bounds
			dragClone = row.cloneNode(true) as HTMLElement;
			dragClone.style.position = 'absolute';
			dragClone.style.pointerEvents = 'none';
			dragClone.style.zIndex = '1000';
			dragClone.style.opacity = '0.8';
			dragClone.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
			dragClone.style.width = row.offsetWidth + 'px';
			dragClone.style.backgroundColor = 'var(--background)';
			dragClone.style.border = '1px solid var(--border)';

			// Copy column widths from original row to maintain alignment
			const originalCells = row.querySelectorAll('td');
			const cloneCells = dragClone.querySelectorAll('td');
			originalCells.forEach((cell, i) => {
				if (cloneCells[i]) {
					cloneCells[i].style.width = cell.offsetWidth + 'px';
					cloneCells[i].style.minWidth = cell.offsetWidth + 'px';
					cloneCells[i].style.maxWidth = cell.offsetWidth + 'px';
				}
			});
			// Add clone to tbody
			const tbody = row.closest('tbody');
			if (tbody) tbody.appendChild(dragClone);
			// Completely hide original element
			row.style.display = 'none';
			// Position clone at mouse
			updateClonePosition(event.clientX, event.clientY);
			// Trigger initial gap detection
			handleMouseMove(event);
		}
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		event.preventDefault();
	}

	function updateClonePosition(x: number, y: number) {
		if (dragClone) {
			const tbody = dragClone.closest('tbody');
			if (tbody) {
				// Set tbody as positioned container
				tbody.style.position = 'relative';
				const tbodyRect = tbody.getBoundingClientRect();
				const relativeX = x - tbodyRect.left - 10;
				const relativeY = y - tbodyRect.top - 20;
				// Keep within tbody bounds
				const maxX = tbody.offsetWidth - dragClone.offsetWidth;
				const maxY = tbody.offsetHeight - dragClone.offsetHeight;
				const clampedX = Math.max(0, Math.min(relativeX, maxX));
				const clampedY = Math.max(0, Math.min(relativeY, maxY));
				dragClone.style.left = clampedX + 'px';
				dragClone.style.top = clampedY + 'px';
			}
		}
	}

	function handleMouseMove(event: MouseEvent) {
		if (!isDragging || dragSourceIndex === null || !dragElement) return;
		// Update clone position
		updateClonePosition(event.clientX, event.clientY);
		// Remove all previous drop gap elements
		document.querySelectorAll('tr.drop-gap').forEach(gap => {
			gap.remove();
		});
		isAtEnd = false;
		// Temporarily hide clone for detection
		if (dragClone) dragClone.style.display = 'none';
		const elementBelow = document.elementFromPoint(event.clientX, event.clientY);
		if (dragClone) dragClone.style.display = '';
		const rowBelow = elementBelow?.closest('tr');
		const tbody = dragElement.closest('tbody');
		if (!tbody) return;
		const allRows = Array.from(tbody.querySelectorAll('tr:not(.drop-gap)'));
		const tbodyRect = tbody.getBoundingClientRect();
		// Check if we're at the top for dropping at the beginning
		const firstRow = allRows[0];
		if (firstRow && firstRow !== dragElement) {
			const firstRowRect = firstRow.getBoundingClientRect();
			// Show drop gap at beginning if:
			// 1. Mouse Y is above the first row, OR
			// 2. Mouse is outside the table horizontally but we're in the dragging area above first row, OR
			// 3. Mouse is within table bounds and near the top
			const isAbove = event.clientY < firstRowRect.top;
			const isWithinTableX = event.clientX >= tbodyRect.left && event.clientX <= tbodyRect.right;
			const isNearTop = event.clientY < firstRowRect.top + firstRowRect.height * 0.3 && isWithinTableX;
			const isOutsideTable = event.clientX < tbodyRect.left || event.clientX > tbodyRect.right || event.clientY < tbodyRect.top;
			if (isAbove || isNearTop || (isOutsideTable && event.clientY < firstRowRect.bottom)) {
				dragOverIndex = 0;
				const dropGap = document.createElement('tr');
				dropGap.className = 'drop-gap';
				dropGap.innerHTML = `<td colspan="4" class="drop-indicator"></td>`;
				// Insert gap before the first row
				tbody.insertBefore(dropGap, firstRow);
				return;
			}
		}

		// Check if we're at the bottom for dropping at the end
		const lastRow = allRows[allRows.length - 1];
		if (lastRow && lastRow !== dragElement) {
			const lastRowRect = lastRow.getBoundingClientRect();
			// Show drop gap at end if:
			// 1. Mouse Y is below the last row, OR
			// 2. Mouse is outside the table horizontally but we're in the dragging area, OR
			// 3. Mouse is within table bounds and near the bottom
			const isBelow = event.clientY > lastRowRect.bottom;
			const isWithinTableX = event.clientX >= tbodyRect.left && event.clientX <= tbodyRect.right;
			const isNearBottom = event.clientY > lastRowRect.bottom - lastRowRect.height * 0.3 && isWithinTableX;
			const isOutsideTable = event.clientX < tbodyRect.left || event.clientX > tbodyRect.right || event.clientY > tbodyRect.bottom;
			// If we previously were at the end and now we're outside the table, keep the gap at the end
			if (isBelow || isNearBottom || (isOutsideTable && event.clientY > lastRowRect.top)) {
				dragOverIndex = allRows.length;
				isAtEnd = true;
				const dropGap = document.createElement('tr');
				dropGap.className = 'drop-gap';
				dropGap.innerHTML = `<td colspan="4" class="drop-indicator"></td>`;
				tbody.appendChild(dropGap);
				return;
			}
		}
		// Check if we're hovering over a specific row (middle area)
		if (rowBelow && rowBelow !== dragElement && !rowBelow.classList.contains('drop-gap')) {
			const newIndex = allRows.indexOf(rowBelow);
			if (newIndex !== -1 && newIndex !== dragSourceIndex) {
				const rowRect = rowBelow.getBoundingClientRect();
				const rowMiddle = rowRect.top + rowRect.height / 2;
				if (event.clientY < rowMiddle) dragOverIndex = newIndex;
				else dragOverIndex = newIndex + 1;
				// Create drop gap
				const dropGap = document.createElement('tr');
				dropGap.className = 'drop-gap';
				dropGap.innerHTML = `<td colspan="4" class="drop-indicator"></td>`;
				if (event.clientY < rowMiddle) rowBelow.parentNode?.insertBefore(dropGap, rowBelow);
				else {
					// Insert gap after the target row
					const nextRow = rowBelow.nextElementSibling;
					if (nextRow) rowBelow.parentNode?.insertBefore(dropGap, nextRow);
					else tbody.appendChild(dropGap);
				}
			}
		}
	}

	function handleMouseUp() {
		if (!isDragging || dragSourceIndex === null) return;
		// Remove all gap elements
		document.querySelectorAll('tr.drop-gap').forEach(gap => {
			gap.remove();
		});
		// Remove clone
		if (dragClone) {
			const tbody = dragClone.closest('tbody');
			if (tbody && tbody.contains(dragClone)) {
				tbody.removeChild(dragClone);
				// Reset tbody positioning
				tbody.style.position = '';
			}
			dragClone = null;
		}
		// Reset drag element styles
		if (dragElement) {
			dragElement.style.display = '';
			dragElement.style.opacity = '';
		}
		// Perform reorder if needed
		if (dragOverIndex !== null && dragOverIndex !== dragSourceIndex) {
			const reordered = [...$wallets];
			const [moved] = reordered.splice(dragSourceIndex, 1);
			// If dragOverIndex is greater than the original position and we moved an element before it,
			// we need to adjust the target index
			let targetIndex = dragOverIndex;
			if (dragOverIndex > dragSourceIndex) targetIndex = dragOverIndex - 1;
			reordered.splice(targetIndex, 0, moved);
			reorderWallets(reordered);
		}
		// Cleanup
		dragSourceIndex = null;
		dragOverIndex = null;
		isDragging = false;
		dragElement = null;
		isAtEnd = false;
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	}
</script>

<style>
	.item {
		padding: 10px;
		min-height: 40px;
		box-sizing: border-box;
	}

	.drag-handle {
		cursor: grab;
		padding: 0 5px;
		color: var(--primary-foreground);
		user-select: none;
		transition: color 0.2s ease;
	}

	.drag-handle:hover {
		color: var(--primary);
	}

	.drag-handle:active {
		cursor: grabbing;
	}

	/* Gap elements for drag and drop */
	:global(tr.drop-gap) {
		background: transparent !important;
		border: none !important;
	}

	:global(tr.drop-gap td) {
		border: none !important;
		padding: 0 !important;
	}

	:global(.drop-indicator) {
		height: 30px !important;
		background: rgba(var(--primary-rgb, 74, 144, 226), 0.1) !important;
		border: 2px dashed var(--primary) !important;
		border-radius: 4px !important;
		margin: 2px 4px !important;
		display: block !important;
	}
</style>

<ButtonBar equalize>
	<Button img="modules/{module.identifier}/img/wallet-add.svg" text="Add a new wallet" onClick={() => setSettingsSection('wallets-add')} />
	<Button img="modules/{module.identifier}/img/recover.svg" text="Recover from seed" onClick={() => elWindowRecover?.open()} />
</ButtonBar>

{#if $wallets?.length === 0}
	<div class="bold">No wallets found</div>
{/if}

{#if $wallets?.length > 0}
	<Table breakpoint="0">
		<Thead>
			<TheadTr>
				<Th></Th>
				<Th>Name</Th>
				<Th align="center">Addresses</Th>
				<Th>Action</Th>
			</TheadTr>
		</Thead>
		<Tbody>
			{#each $wallets as wallet, index (wallet.address)}
				<TbodyTr>
					<Td padding="5px" style="width: 30px;">
						<div class="drag-handle" role="button" tabindex="0" onmousedown={e => handleMouseDown(e, index)}>⋮⋮</div>
					</Td>
					<Td padding="0" expand>
						<Clickable onClick={() => clickWallet(wallet)}>
							<div class="item">{wallet.name}</div>
						</Clickable>
					</Td>
					<Td padding="0" align="center">
						<Clickable onClick={() => clickWallet(wallet)}>
							<div class="item">{wallet?.addresses?.length || '0'}</div>
						</Clickable>
					</Td>
					<Td padding="0">
						<TableActionItems>
							<Icon img="modules/{module.identifier}/img/wallet-address.svg" alt="Addresses" size="20px" padding="5px" onClick={() => clickWallet(wallet)} />
							<Icon img="img/edit.svg" colorVariable="--primary-foreground" alt="Edit" size="20px" padding="5px" onClick={() => editWallet(wallet)} />
							<Icon img="img/del.svg" colorVariable="--primary-foreground" alt="Delete" size="20px" padding="5px" onClick={() => delWallet(wallet)} />
						</TableActionItems>
					</Td>
				</TbodyTr>
			{/each}
		</Tbody>
	</Table>
{/if}
<Window title="Recover wallet from seed" body={WindowRecover} bind:this={elWindowRecover} />
<Window title="Edit wallet name" body={WindowWalletsEdit} params={{ wallet: selectedWallet }} bind:this={elWindowWalletsEdit} />
<Window title="Wallet details" body={WindowWalletsWallet} params={{ wallet: selectedWallet }} bind:this={elWindowWalletsWallet} />
{#if selectedWallet}
	<DialogWalletsDel wallet={selectedWallet} bind:this={elDialogWalletsDel} />
{/if}
