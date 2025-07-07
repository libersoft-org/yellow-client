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
	let currentDropIndex: number = -1;

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
		currentDropIndex = -1; // Reset pozice díry

		const target = event.currentTarget as HTMLElement;
		const row = target.closest('tr') as HTMLElement;
		draggedElement = row;

		// Najít tbody element
		tbodyElement = row.closest('tbody') as HTMLElement;

		// Uložit původní pozici a velikost
		const rect = row.getBoundingClientRect();
		const tbodyRect = tbodyElement.getBoundingClientRect();

		// Uložit původní šířky buněk před zahájením dragování
		const cells = row.querySelectorAll('td');
		const originalWidths: number[] = [];
		cells.forEach((cell, index) => {
			originalWidths[index] = (cell as HTMLElement).getBoundingClientRect().width;
		});

		// Vypočítat offset
		dragOffset.x = event.clientX - rect.left;
		dragOffset.y = event.clientY - rect.top;

		// Přidat event listenery
		document.addEventListener('mousemove', handleDragMove);
		document.addEventListener('mouseup', handleDragEnd);

		// Vytvořit placeholder na místo dragovaného řádku
		const placeholder = document.createElement('tr');
		placeholder.classList.add('drag-placeholder');
		placeholder.style.height = rect.height + 'px';
		placeholder.style.opacity = '0';
		placeholder.innerHTML = '<td colspan="4"></td>';

		// Vložit placeholder před dragovaný řádek
		row.parentNode?.insertBefore(placeholder, row);

		// Styly pro dragged element - absolute positioning
		row.style.position = 'absolute';
		row.style.left = rect.left - tbodyRect.left + 'px';
		row.style.top = rect.top - tbodyRect.top + 'px';
		row.style.width = rect.width + 'px';
		row.style.zIndex = '1000';
		row.style.opacity = '0.8';
		row.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
		row.style.pointerEvents = 'none';
		row.style.transition = 'none';
		row.style.tableLayout = 'fixed';

		// Uložit původní šířky do data atributu pro pozdější použití
		row.setAttribute('data-original-widths', JSON.stringify(originalWidths));

		// Nastavit šířky buněk
		cells.forEach((cell, index) => {
			if (originalWidths[index]) {
				(cell as HTMLElement).style.width = originalWidths[index] + 'px';
				(cell as HTMLElement).style.minWidth = originalWidths[index] + 'px';
				(cell as HTMLElement).style.maxWidth = originalWidths[index] + 'px';
			}
		});

		// Připravit řádky na animace
		const allRows = Array.from(tbodyElement.children) as HTMLElement[];
		allRows.forEach((r, i) => {
			// Všechny řádky - připravit na animace (except dragovaný element a placeholder)
			if (r !== row && !r.classList.contains('drag-placeholder')) {
				r.style.transition = 'transform 0.3s ease-out';
			}
		});
	}

	function handleDragMove(event: MouseEvent) {
		if (!isDragging || !draggedElement || !tbodyElement) return;

		// Aktualizovat pozici dragovaného elementu
		const tbodyRect = tbodyElement.getBoundingClientRect();
		const newY = event.clientY - dragOffset.y - tbodyRect.top;

		// Omezit pohyb v rámci tabulky
		const minY = 0;
		const maxY = tbodyRect.height - draggedElement.offsetHeight;
		const constrainedY = Math.max(minY, Math.min(maxY, newY));

		draggedElement.style.top = constrainedY + 'px';

		// Najít všechny řádky kromě dragovaného a placeholderu
		const allRows = Array.from(tbodyElement.children) as HTMLElement[];
		const regularRows = allRows.filter(row => row !== draggedElement && !row.classList.contains('drag-placeholder'));

		// Najít placeholder
		const placeholder = tbodyElement.querySelector('.drag-placeholder') as HTMLElement;
		if (!placeholder) return;

		// Najít nový drop index na základě pozice myši
		let newDropIndex = -1;
		const mouseY = event.clientY;

		for (let i = 0; i < regularRows.length; i++) {
			const rowRect = regularRows[i].getBoundingClientRect();
			const rowCenter = rowRect.top + rowRect.height / 2;

			if (mouseY <= rowCenter) {
				newDropIndex = i;
				break;
			}
		}

		// Pokud jsme na konci, drop na poslední pozici
		if (newDropIndex === -1) {
			newDropIndex = regularRows.length;
		}

		// Pouze pokud se pozice změnila
		if (newDropIndex !== currentDropIndex) {
			currentDropIndex = newDropIndex;

			// Přesunout placeholder na novou pozici
			if (newDropIndex >= regularRows.length) {
				// Na konec
				tbodyElement.appendChild(placeholder);
			} else {
				// Před konkrétní řádek
				tbodyElement.insertBefore(placeholder, regularRows[newDropIndex]);
			}

			// Reset transformací všech řádků
			regularRows.forEach(row => {
				row.style.transform = '';
			});
		}
	}

	function handleDragEnd(event: MouseEvent) {
		if (!isDragging || !draggedElement || !tbodyElement || draggedIndex === null) return;

		// Odstranit event listenery
		document.removeEventListener('mousemove', handleDragMove);
		document.removeEventListener('mouseup', handleDragEnd);

		// Najít placeholder a zjistit jeho pozici
		const placeholder = tbodyElement.querySelector('.drag-placeholder') as HTMLElement;
		let finalDropIndex = draggedIndex; // Default, pokud se nic nestalo

		if (placeholder) {
			// Najít všechny řádky kromě dragovaného a placeholderu
			const allRows = Array.from(tbodyElement.children) as HTMLElement[];
			const regularRows = allRows.filter(row => row !== draggedElement && !row.classList.contains('drag-placeholder'));

			// Najít pozici placeholderu
			const placeholderIndex = Array.from(tbodyElement.children).indexOf(placeholder);

			// Počítat pouze řádky před placeholderem
			let rowsBeforePlaceholder = 0;
			for (let i = 0; i < placeholderIndex; i++) {
				const row = tbodyElement.children[i];
				if (row !== draggedElement && !row.classList.contains('drag-placeholder')) {
					rowsBeforePlaceholder++;
				}
			}

			finalDropIndex = rowsBeforePlaceholder;
		}

		console.log('Final drop calculation:', { draggedIndex, finalDropIndex });

		// Přeusporučádat wallets pouze pokud se pozice změnila
		if (finalDropIndex !== draggedIndex) {
			const reorderedWallets = [...$wallets];
			const [moved] = reorderedWallets.splice(draggedIndex, 1);
			reorderedWallets.splice(finalDropIndex, 0, moved);
			reorderWallets(reorderedWallets);
			console.log('Reordered from', draggedIndex, 'to', finalDropIndex);
		}

		// Odstranit placeholder
		if (placeholder) {
			placeholder.remove();
		}

		// Vyčistit všechny styly z všech řádků
		const cleanupElements = Array.from(tbodyElement.children) as HTMLElement[];
		cleanupElements.forEach(row => {
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
		currentDropIndex = -1;
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
		transition: transform 0.3s ease-out;
	}

	/* Drop target indikátor */
	:global(tr.drop-target) {
		border-top: 2px solid var(--primary-foreground);
	}

	/* Placeholder pro dragovaný řádek */
	:global(tr.drag-placeholder) {
		background-color: rgba(var(--primary-foreground-rgb), 0.1);
		border: 2px dashed rgba(var(--primary-foreground-rgb), 0.3);
		transition: all 0.3s ease;
	}

	:global(tr.drag-placeholder td) {
		padding: 0;
		border: none;
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
