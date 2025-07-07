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

	// Vlastní drag and drop systém
	let draggedIndex: number | null = null;
	let draggedElement: HTMLElement | null = null;
	let isDragging = $state(false);
	let dragOffset = { x: 0, y: 0 };
	let tbodyElement: HTMLElement | null = null;

	async function clickWallet(wallet: IWallet) {
		await setSettingsSection('wallets-' + wallet.address);
	}

	function delWallet(wallet: IWallet) {
		selectedWallet = wallet;
		elDialogWalletsDel?.open();
	}

	function editWallet(wallet: IWallet) {
		selectedWallet = wallet;
		elWindowWalletsEdit?.open();
	}

	// Vlastní drag and drop implementace
	function handleDragStart(event: MouseEvent, index: number) {
		event.preventDefault();
		draggedIndex = index;
		isDragging = true;

		const target = event.currentTarget as HTMLElement;
		const row = target.closest('tr') as HTMLElement;
		draggedElement = row;

		// Najít tbody element
		tbodyElement = row.closest('tbody') as HTMLElement;

		// Uložit původní šířky buněk před zahájením dragování
		const cells = row.querySelectorAll('td');
		const originalWidths: number[] = [];
		cells.forEach((cell, index) => {
			originalWidths[index] = (cell as HTMLElement).getBoundingClientRect().width;
		});

		// Vypočítat offset
		const rect = row.getBoundingClientRect();
		dragOffset.x = event.clientX - rect.left;
		dragOffset.y = event.clientY - rect.top;

		// Přidat event listenery
		document.addEventListener('mousemove', handleDragMove);
		document.addEventListener('mouseup', handleDragEnd);

		// Styly pro dragged element
		row.style.position = 'relative';
		row.style.zIndex = '1000';
		row.style.opacity = '0.8';
		row.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
		row.style.pointerEvents = 'none';
		row.style.transition = 'none'; // Vypnout animace pro dragovaný element

		// Uložit původní šířky do data atributu pro pozdější použití
		row.setAttribute('data-original-widths', JSON.stringify(originalWidths));

		// Připravit řádky na animace
		const allRows = Array.from(tbodyElement.children) as HTMLElement[];
		allRows.forEach((r, i) => {
			// Všechny řádky - připravit na animace
			r.style.transition = 'transform 0.2s ease-out, margin 0.2s ease-out';
		});
	}

	let dropHoleElement: HTMLElement | null = null;

	function handleDragMove(event: MouseEvent) {
		if (!draggedElement || !tbodyElement) return;

		const tbodyRect = tbodyElement.getBoundingClientRect();

		// Omezit pozici na tbody
		const x = Math.min(Math.max(event.clientX - dragOffset.x, tbodyRect.left), tbodyRect.right - draggedElement.offsetWidth);
		const y = Math.min(Math.max(event.clientY - dragOffset.y, tbodyRect.top), tbodyRect.bottom - draggedElement.offsetHeight);

		// Relativní pozice k tbody
		const relativeX = x - tbodyRect.left;
		const relativeY = y - tbodyRect.top;

		draggedElement.style.position = 'absolute';
		draggedElement.style.left = relativeX + 'px';
		draggedElement.style.top = relativeY + 'px';

		// Zachovat původní šířku řádku a buněk
		draggedElement.style.width = tbodyRect.width + 'px';
		draggedElement.style.tableLayout = 'fixed';

		// Zachovat šířky jednotlivých buněk
		const cells = draggedElement.querySelectorAll('td');
		const originalWidths = JSON.parse(draggedElement.getAttribute('data-original-widths') || '[]');

		cells.forEach((cell, index) => {
			if (originalWidths[index]) {
				(cell as HTMLElement).style.width = originalWidths[index] + 'px';
				(cell as HTMLElement).style.minWidth = originalWidths[index] + 'px';
				(cell as HTMLElement).style.maxWidth = originalWidths[index] + 'px';
			}
		});

		// Najít drop target - počítat pouze normální řádky (ne drop holes)
		const allElements = Array.from(tbodyElement.children) as HTMLElement[];
		const normalRows = allElements.filter(row => !row.classList.contains('drop-hole'));
		const currentY = event.clientY;

		let dropIndex = -1;
		for (let i = 0; i < normalRows.length; i++) {
			if (i === draggedIndex) continue;

			const rowRect = normalRows[i].getBoundingClientRect();
			const rowMiddle = rowRect.top + rowRect.height / 2;

			if (currentY < rowMiddle) {
				dropIndex = i;
				break;
			}
		}

		if (dropIndex === -1) {
			dropIndex = normalRows.length;
		}

		console.log('Debug:', { draggedIndex, dropIndex, normalRowsLength: normalRows.length });

		// Odstranit předchozí drop hole
		if (dropHoleElement) {
			dropHoleElement.remove();
			dropHoleElement = null;
		}

		// Vytvořit nový drop hole pouze pokud se pozice změnila
		if (draggedIndex !== null && dropIndex !== draggedIndex) {
			const holeHeight = draggedElement!.offsetHeight;

			// Vytvořit prázdný řádek jako "díru"
			dropHoleElement = document.createElement('tr');
			dropHoleElement.className = 'drop-hole';
			dropHoleElement.style.height = holeHeight + 'px';
			dropHoleElement.style.background = 'rgba(var(--primary-rgb), 0.1)';
			dropHoleElement.style.border = '2px dashed var(--primary)';
			dropHoleElement.style.borderRadius = '4px';
			dropHoleElement.style.transition = 'all 0.2s ease-out';

			// Vytvořit jednu buňku, která se rozprostře přes celou šířku
			const holeCell = document.createElement('td');
			holeCell.setAttribute('colspan', '4'); // Počet sloupců v tabulce
			holeCell.style.height = holeHeight + 'px';
			holeCell.style.padding = '0';
			holeCell.style.border = 'none';
			holeCell.style.background = 'transparent';

			dropHoleElement.appendChild(holeCell);

			// Vložit hole na správnou pozici mezi normální řádky
			if (dropIndex < normalRows.length) {
				// Najít správný element v DOM (možná mezi normal rows jsou už drop holes)
				const targetRow = normalRows[dropIndex];
				tbodyElement.insertBefore(dropHoleElement, targetRow);
				console.log('Creating hole before normal row index:', dropIndex);
			} else {
				// Vložit na konec
				tbodyElement.appendChild(dropHoleElement);
				console.log('Creating hole at end');
			}
		}
	}

	function handleDragEnd(event: MouseEvent) {
		if (!draggedElement || !tbodyElement || draggedIndex === null) return;

		// Odstranit event listenery
		document.removeEventListener('mousemove', handleDragMove);
		document.removeEventListener('mouseup', handleDragEnd);

		// Odstranit drop hole pokud existuje
		if (dropHoleElement) {
			dropHoleElement.remove();
			dropHoleElement = null;
		}

		// Najít finální drop pozici - počítat pouze normální řádky (ne drop holes)
		const finalAllElements = Array.from(tbodyElement.children) as HTMLElement[];
		const finalNormalRows = finalAllElements.filter(row => !row.classList.contains('drop-hole'));
		const currentY = event.clientY;

		let dropIndex = -1;
		for (let i = 0; i < finalNormalRows.length; i++) {
			if (i === draggedIndex) continue;

			const rowRect = finalNormalRows[i].getBoundingClientRect();
			const rowMiddle = rowRect.top + rowRect.height / 2;

			if (currentY < rowMiddle) {
				dropIndex = i;
				break;
			}
		}

		if (dropIndex === -1) {
			dropIndex = finalNormalRows.length;
		}

		// Přeuspoužádáj wallets pouze pokud se pozice změnila
		if (dropIndex !== draggedIndex) {
			const reorderedWallets = [...$wallets];
			const [moved] = reorderedWallets.splice(draggedIndex, 1);
			reorderedWallets.splice(dropIndex, 0, moved);
			reorderWallets(reorderedWallets);
		}

		// Vyčistit všechny styly z všech řádků (včetně možných drop holes)
		const cleanupElements = Array.from(tbodyElement.children) as HTMLElement[];
		cleanupElements.forEach(row => {
			// Pokud je to drop hole, odstranit ho
			if (row.classList.contains('drop-hole')) {
				row.remove();
				return;
			}

			row.style.position = '';
			row.style.zIndex = '';
			row.style.opacity = '';
			row.style.transform = '';
			row.style.boxShadow = '';
			row.style.pointerEvents = '';
			row.style.left = '';
			row.style.top = '';
			row.style.width = '';
			row.style.height = '';
			row.style.visibility = '';
			row.style.borderTop = '';
			row.style.borderBottom = '';
			row.style.tableLayout = '';
			row.style.transition = '';
			row.style.marginTop = '';
			row.style.marginBottom = '';
			row.style.paddingTop = '';
			row.style.paddingBottom = '';
			row.style.background = '';
			row.style.border = '';
			row.style.borderRadius = '';
			row.removeAttribute('data-original-widths');

			// Vyčistit styly buněk
			const cells = row.querySelectorAll('td');
			cells.forEach(cell => {
				(cell as HTMLElement).style.width = '';
				(cell as HTMLElement).style.minWidth = '';
				(cell as HTMLElement).style.maxWidth = '';
				(cell as HTMLElement).style.padding = '';
				(cell as HTMLElement).style.border = '';
				(cell as HTMLElement).style.background = '';
			});
		});

		// Reset state
		isDragging = false;
		draggedIndex = null;
		draggedElement = null;
		tbodyElement = null;
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

	/* Kontejner pro drag operaci */
	:global(tbody) {
		position: relative;
		overflow: visible;
	}

	/* Styl pro dragovaný řádek */
	:global(tr.dragging) {
		opacity: 0.8;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
		z-index: 1000;
		pointer-events: none;
	}

	/* Základní animace pro řádky */
	:global(tr) {
		transition:
			transform 0.2s ease-out,
			margin 0.2s ease-out;
	}

	/* Drop target indikátor */
	:global(tr.drop-target) {
		border-top: 2px solid var(--primary-foreground);
	}

	/* Drop target před řádkem - vytvoří mezeru nahoře */
	:global(tr.drop-target-before::before) {
		content: '';
		display: block;
		height: var(--drop-height, 50px);
		background: rgba(var(--primary-rgb), 0.1);
		border: 2px dashed var(--primary);
		margin: -2px -10px 0 -10px;
		border-radius: 4px;
		position: relative;
	}

	/* Drop target za řádkem - vytvoří mezeru dole */
	:global(tr.drop-target-after::after) {
		content: '';
		display: block;
		height: var(--drop-height, 50px);
		background: rgba(var(--primary-rgb), 0.1);
		border: 2px dashed var(--primary);
		margin: 0 -10px -2px -10px;
		border-radius: 4px;
		position: relative;
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
						<div class="drag-handle" onmousedown={e => handleDragStart(e, index)}>⋮⋮</div>
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
