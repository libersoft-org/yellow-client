<script lang="ts">
	/**
	 * WARNING: This component has been partially converted to TypeScript.
	 * Some type errors remain that need to be addressed:
	 * - event.referenced_message null check needed (line ~271)
	 * - getLoader return type mismatch with Partial<LoaderItem>
	 * - getHole type literal needs explicit type assertion
	 * - itemsArray initialization with type 'initial_loading_placeholder' needs uid
	 * - Other type incompatibilities that need proper type definitions
	 */
	import { afterUpdate, beforeUpdate, getContext, onMount, setContext, tick } from 'svelte';
	import { get } from 'svelte/store';
	import { online, messagesArray, events, insertEvent, identifier, messagesIsInitialLoading } from '../../messages.js';
	import { getGuid } from '@/core/core.ts';
	import { debug } from '@/core/stores.ts';
	import Button from '@/core/components/Button/Button.svelte';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import resize from '@/core/actions/resizeObserver.ts';
	import { highlightElement } from '@/core/utils/animationUtils.ts';
	import Message from '../Message/Message.svelte';
	import MessageLoader from '../MessageLoader/MessageLoader.svelte';
	import ScrollButton from '../ScrollButton/ScrollButton.svelte';
	import ModalStickersetDetails from '../../modals/ModalStickersetDetails.svelte';
	import ModalForwardMessage from '../../modals/ForwardMessage.svelte';
	import { log } from '@/core/tauri.ts';
	import { modalForwardMessageStore } from '@/org.libersoft.messages/stores/ForwardMessageStore.js';
	import { modalFileUploadStore } from '@/org.libersoft.messages/stores/FileUploadStore.ts';

	interface MessageItem {
		uid: string;
		type: 'message' | 'loader' | 'hole' | 'unseen_marker' | 'no_messages' | 'initial_loading_placeholder';
		id?: number;
		author?: string;
		hide_author?: boolean;
		is_outgoing?: boolean;
		seen?: boolean;
		keep_unseen_bar?: boolean;
		prev?: string | number;
		next?: string | number;
		hole_uid?: string;
		el?: any;
		acc?: any;
		is_lazyloaded?: boolean;
	}

	interface LoaderItem extends MessageItem {
		type: 'loader';
		base: number;
		reason: string;
		active?: boolean;
		delete_me?: boolean;
		force_refresh?: boolean;
		loaderElement?: HTMLElement;
		conversation: any;
	}

	interface HoleItem extends MessageItem {
		type: 'hole';
		top: LoaderItem;
		bottom: LoaderItem;
	}

	interface UIEvent {
		type: string;
		array?: MessageItem[];
		loaders: LoaderItem[];
		savedScrollTop?: number;
		savedScrollHeight?: number;
		wasScrolledToBottom?: boolean;
		wasScrolledToBottom2?: boolean;
		referenced_message?: MessageItem;
	}

	export let conversation: any;
	export let setBarFocus: () => Promise<void>;
	let scrollButtonVisible: boolean = true;
	let elMessages: HTMLDivElement;
	let elUnseenMarker: HTMLDivElement;
	let elModalStickersetDetails: any;
	let anchorElement: HTMLDivElement;
	//let oldLastID: number | null = null;
	let itemsCount: number = 0;
	let itemsArray: (MessageItem | LoaderItem | HoleItem)[] = [];
	let loaders: LoaderItem[] = [];
	let holes: HoleItem[] = [];
	let uiEvents: UIEvent[] = [];
	let stickersetDetailsModalStickerset: any;
	let scrolledToBottom: boolean = true;
	let windowInnerWidth: number;
	let windowInnerHeight: number;
	let showFileDndOverlay: boolean = false;
	let doBlockScroll: boolean = false;
	let fileDndRef: HTMLDivElement;
	let jumped: boolean = false;
	let messagesHeight: number = -1;
	let scrolledToBottom0: boolean = false;
	let scrolledToBottom1: boolean = false;
	let wrapperWidth: number | null = null;
	let elModalForwardMessage: any;
	$: modalForwardMessageStore.set(elModalForwardMessage);

	let {
		setFileUploadModal,
		fileUploadModalFiles,
	}: {
		setFileUploadModal: (show: boolean) => void;
		fileUploadModalFiles: any;
	} = getContext('FileUploadModal');

	$: scrollButtonVisible = !scrolledToBottom;
	$: updateWindowSize(windowInnerWidth, windowInnerHeight);

	onMount(() => {
		setInterval(() => {
			scrolledToBottom0 = scrolledToBottom1;
			scrolledToBottom1 = isScrolledToBottom();
			fixScroll();
		}, 50);
	});

	function disableScroll(): void {
		doBlockScroll = true;
	}

	function enableScroll(): void {
		doBlockScroll = false;
	}

	/*
  // TODO: resizer observer does not trigger when elements change size.
  $: if (elMessages) {
   new ResizeObserver((entries) => { console.log(entries); fixScroll();}).observe(elMessages);
  }
 */

	function fixScroll(): void {
		if (elMessages && jumped) {
			let height = elMessages.scrollHeight;
			if (height != messagesHeight) {
				console.log('messagesHeight:', messagesHeight, 'height:', height);
				console.log('scrolledToBottom0:', scrolledToBottom0, 'scrolledToBottom1:', scrolledToBottom1);
				if (scrolledToBottom0) {
					console.log('fixScroll: scrollToBottom');
					scrollToBottom();
				}
				messagesHeight = height;
			}
		}
	}

	/*
 function test(scrollHeight) {
  console.log('test scrollHeight:', scrollHeight);
  console.log('test isScrolledToBottom():', isScrolledToBottom());
 }
 */

	function openStickersetDetailsModal(stickerset: any): void {
		stickersetDetailsModalStickerset = stickerset;
		//console.log('openStickersetDetailsModal:', stickerset);
		elModalStickersetDetails?.open();
	}

	setContext('openStickersetDetailsModal', openStickersetDetailsModal);

	events.subscribe(e => {
		if (e?.length) {
			console.log('events.subscribe:', e);
			handleEvents(e);
			itemsCount = itemsArray.length;
			events.set([]);
		}
	});

	function saveScrollPosition(event: UIEvent): void {
		if (!elMessages) return;
		event.savedScrollTop = elMessages.scrollTop;
		event.savedScrollHeight = elMessages.scrollHeight;
		//console.log('saveScrollPosition: savedScrollTop:', event.savedScrollTop, 'savedScrollHeight:', event.savedScrollHeight);
	}

	function restoreScrollPosition(event: UIEvent): void {
		//console.log('restoreScrollPosition elMessages.scrollTop:', elMessages.scrollTop, 'elMessages.scrollHeight:', elMessages.scrollHeight);
		if (event.savedScrollHeight !== undefined && event.savedScrollTop !== undefined) {
			const scrollDifference = elMessages.scrollHeight - event.savedScrollHeight;
			console.log('restoreScrollPosition scrollTop');
			elMessages.scrollTop = event.savedScrollTop + scrollDifference;
		}
		//console.log('scrollDifference:', scrollDifference, 'new elMessages.scrollTop:', elMessages.scrollTop);
	}

	function scrollToBottom(): void {
		// TODO: fixme: sometimes does not scroll to bottom properly when two messages appear at once
		//console.log('SCROLLTOBOTTOM');
		if (elMessages) {
			console.log('scrollToBottom');
			elMessages.scrollTop = elMessages.scrollHeight;
		}
	}

	function isScrolledToBottom(): boolean {
		if (elMessages) return checkIfScrolledToBottom(elMessages);
		return false;
	}

	function checkIfScrolledToBottom(div: HTMLDivElement): boolean {
		const result = div.scrollTop + div.clientHeight >= div.scrollHeight - 20;
		///console.log('checkIfScrolledToBottom div.scrollTop:', div.scrollTop, 'div.clientHeight:', div.clientHeight, 'total:', div.scrollTop + div.clientHeight, 'div.scrollHeight:', div.scrollHeight, 'result:', result);
		return result;
	}

	function blockScroll(e: Event): void {
		if (doBlockScroll) {
			e.preventDefault();
			e.stopPropagation();
		}
	}

	let scrollStartPos: number = 0;

	function touchStart(e: TouchEvent): void {
		scrollStartPos = elMessages.scrollTop;
	}

	function touchMove(e: TouchEvent): void {
		if (doBlockScroll) {
			e.preventDefault();
			e.stopPropagation();
			console.log('touchMove: elMessages.scrollTop:');
			elMessages.scrollTop = scrollStartPos;
		}
	}

	function parseScroll(e?: Event): void {
		if (doBlockScroll && e) {
			e.preventDefault();
			e.stopPropagation();
		}
		scrolledToBottom = elMessages?.scrollTop + elMessages?.clientHeight >= elMessages?.scrollHeight - 20;
	}

	function updateWindowSize(width: number, height: number): void {
		//console.log('updateWindowSize width:', width, 'height:', height);
		parseScroll();
	}

	beforeUpdate(() => {
		if (!elMessages) return;
		//console.log('beforeUpdate: elMessages.scrollTop:', elMessages.scrollTop, 'elMessages.scrollHeight:', elMessages.scrollHeight);
	});

	afterUpdate(async () => {
		if (!elMessages) return;
		await tick();
		for (let event of uiEvents) {
			//console.log('uiEvent:', event);
			if (event.type === 'gc') {
				//console.log('gc');
			} else if (event.type === 'lazyload_prev') {
				restoreScrollPosition(event);
			} else if (event.type === 'lazyload_next') {
				await jumpToLazyLoaderFromTop(event);
			} else if (event.type === 'new_message') {
				console.log('new_message scrollToBottom:', event);
				if (event.wasScrolledToBottom) scrollToBottom();
			} else if (event.type === 'send_message') {
				console.log('send_message scrollToBottom:', event);
				if (event.wasScrolledToBottom) scrollToBottom();
			} else if (event.type === 'initial_load') {
				if (elUnseenMarker) {
					console.log('initial_load elUnseenMarker.scrollIntoView');
					elMessages.scrollTop = elMessages.scrollHeight;
					await tick();
					elUnseenMarker.scrollIntoView();
				} else {
					console.log('initial_load scrollToBottom');
					scrollToBottom();
				}
			} else if (event.type === 'jump_to_referenced_message') {
				setTimeout(() => {
					if (event.referenced_message) {
						const msgEl = event.referenced_message.el.getRef();
						console.log('jump_to_referenced_message scrollIntoView:', msgEl);
						msgEl.scrollIntoView({ behavior: 'instant' });
						highlightElement(msgEl);
					}
				}, 200); // TODO: check for better solution - may be buggy on slow computers (if there is no timeout set it scroll jump to message)
			} else if (event.type === 'properties_update') {
				//console.log('properties_update');
			} else if (event.type === 'resize') {
				//console.log('resize uiEvent:', event);
				if (event.wasScrolledToBottom || event.wasScrolledToBottom2) {
					setTimeout(() => {
						console.log('resize scrollToBottom');
						scrollToBottom();
					}, 0);
					//scrollToBottom();
				}
			}
		}
		let events = [...uiEvents];
		uiEvents = [];
		await tick();
		let activatedCount = 0;
		for (let event of events) {
			//console.log('event:', event);
			for (let loader of event.loaders) {
				//console.log('activate loader:', loader);
				loader.active = true;
				activatedCount++;
			}
		}
		if (activatedCount > 0) {
			console.log('activatedCount:', activatedCount, 'itemsArray');
			itemsArray = itemsArray;
			for (let i = 0; i < itemsArray.length; i++) itemsArray[i] = itemsArray[i];
		}
		jumped = true;
	});

	function getLoader(l: Partial<LoaderItem> & { base: number }): LoaderItem {
		loaders = loaders.filter(i => !i.delete_me);
		for (let i of loaders) {
			if (i.base === l.base && i.prev === l.prev && i.next === l.next) return i;
		}
		const loader: LoaderItem = {
			...l,
			uid: getGuid(),
			type: 'loader',
			conversation: conversation,
			base: l.base,
			reason: l.reason || '',
		} as LoaderItem;
		loaders.push(loader);
		return loader;
	}

	function getHole(top: LoaderItem, bottom: LoaderItem): HoleItem {
		let uid = top.uid + '_' + bottom.uid;
		for (let i of holes) {
			if (i.uid === uid) return i;
		}
		let hole: HoleItem = {
			type: 'hole' as const,
			top: top,
			bottom: bottom,
			uid: uid,
		};
		holes.push(hole);
		top.hole_uid = hole.uid;
		bottom.hole_uid = hole.uid;
		return hole;
	}

	function gc(): void {
		//console.log('gc random slice of messagesArray...');
		let x = get(messagesArray);
		let i = Math.floor(Math.random() * x.length);
		x.splice(i, Math.floor(Math.random() * 40));
		messagesArray.set(x);
		insertEvent({ type: 'gc', array: get(messagesArray) });
	}

	$: log.debug('itemsArray:', itemsArray);

	async function jumpToLazyLoaderFromTop(event: UIEvent): Promise<void> {
		//console.log('jumpToLazyLoaderFromTop:', event);
		let el;
		for (let l of event.loaders) {
			//   console.log('jumpToLazyLoaderFromTop: l:', l);
			if (l.reason === 'lazyload_next' && l.loaderElement) {
				el = l.loaderElement;
				break;
			}
		}
		if (el) {
			console.log('jumpToLazyLoaderFromTop: el:', el, 'scrollTop');
			elMessages.scrollTop = 0;
			scrolledToBottom0 = false;
			scrolledToBottom1 = false;
			await tick();
			//await el.scrollIntoView();
		}
	}

	async function handleEvents(events: UIEvent[]): Promise<void> {
		console.log('handleEvents:', events);
		if (events.length === 1 && events[0].type === 'properties_update') {
			console.log('properties_update itemsArray');
			itemsArray = itemsArray;
			return;
		}
		// force_refresh is used when deleting message. Normally, Loaders would, after loadMessages, only issue an event if any new messages are actually added. But if we delete a message, we need to remove the loader. So, the gc event, triggered as soon as the message is removed from messagesArray, lets us know to tell all loaders to force_refresh when they trigger. This is not optimal, as only the exact hole inserted in place of the deleted message should force_refresh, but it will work.
		let force_refresh = events.some(e => e.type === 'gc');
		for (let i = 0; i < events.length; i++) {
			//console.log('handleEvent:', events[i]);
			let event = events[i];
			event.loaders = [];
			if (uiEvents.length > 0 && uiEvents[uiEvents.length - 1].type === 'resize' && event.type === 'resize') continue;
			uiEvents.push(event);
			saveScrollPosition(event);
			/* TODO 1 :
   do not scroll to bottom on new messages if unread_marker is present (or rather, if window is not active and only unread messages are at the bottom - see also contact list red number )
   */
			/*
   save: wasScrolledTo = 'bottom'
   wasScrolledTo = message object / message-list element uid ?
*/

			event.wasScrolledToBottom = isScrolledToBottom();
			if (i != events.length - 1) continue;
			if (event.type === 'resize') continue;
			if (event.array === undefined) return;
			let messages = event.array;
			if (messages.length === 1 && messages[0].type === 'initial_loading_placeholder') {
				loaders = [];
				holes = [];
				console.log('handleEvents: initial_loading_placeholder itemsArray');
				itemsArray = messages;
				return;
			}
			if (messages.length === 0) {
				console.log('handleEvents: no messages itemsArray');
				itemsArray = [{ type: 'initial_loading_placeholder', uid: 'initial_loading' } as MessageItem];
				return;
			}
			messages = mergeAuthorship(messages);
			for (let m of messages) {
				if (!m.acc || m.uid === undefined) {
					//(typeof m !== Message)
					console.log('getItems: Invalid item: ', typeof m, m);
					throw new Error('getItems: Invalid item: ' + JSON.stringify(m));
				}
			}
			// messages are sorted in correct order at this point.
			// add lazyloaders where there is discontinuity.
			let items: (MessageItem | LoaderItem | HoleItem)[] = [];
			// add a loader at the top if first message is not the first message in the chat
			if (messages[0].prev !== 'none' && messages[0].id !== undefined) {
				let l = getLoader({ prev: 10, base: messages[0].id, reason: 'lazyload_prev' });
				l.force_refresh = force_refresh;
				event.loaders.push(l);
				items.unshift(l);
			}
			let unseen_marker_put = false;
			//scroll = isScrolledToBottom();
			// walk all messages, add loaders where there are discontinuities
			for (let i = 0; i < messages.length; i++) {
				let m = messages[i];
				//console.log('m:', m);
				//console.log('if (!unseen_marker_put && !m.is_outgoing && (!m.seen || m.keep_unseen_bar)):', !unseen_marker_put, !m.is_outgoing, !m.seen, m.keep_unseen_bar);
				if (!unseen_marker_put && !m.is_outgoing && (!m.seen || m.keep_unseen_bar)) {
					//console.log('ADDING-UNSEEN-MARKER');
					items.push({ type: 'unseen_marker', uid: 'unseen_marker' } as MessageItem);
					unseen_marker_put = true;
				}
				items.push(m);
				/*if (m.id !== undefined && m.id > oldLastID) {
					oldLastID = m.id;
					//if (m.is_lazyloaded) scroll = false;
				}*/
				let next = messages[i + 1];
				if (next && next.id !== undefined && m.next !== 'none' && m.next !== undefined && m.next !== next.id) {
					console.log('INSERTING-HOLE-BETWEEN', m, 'and', next);
					//console.log(JSON.stringify(m), JSON.stringify(next));
					//console.log('m.next:', m.next, 'next.id:', next.id);
					let l1 = getLoader({ next: 5, base: m.id!, reason: 'lazyload_next' });
					l1.force_refresh = force_refresh;
					let l2 = getLoader({ prev: 5, base: next.id, reason: 'lazyload_prev' });
					l2.force_refresh = force_refresh;
					event.loaders.push(l1);
					event.loaders.push(l2);
					items.push(getHole(l1, l2));
				}
			}
			let last = messages[messages.length - 1];
			if (last.next !== undefined && last.next !== 'none' && last.id !== undefined) {
				//console.log('ADDING-LOADER-AT-THE-END because ', JSON.stringify(last, null, 2));
				//console.log(last.next);
				let l = getLoader({ next: 10, base: last.id, reason: 'lazyload_next' });
				l.force_refresh = force_refresh;
				event.loaders.push(l);
				items.push(l);
			}
			console.log('handleEvents: itemsArray updated');
			itemsArray = items;
		}
	}

	function mergeAuthorship(messages: MessageItem[]): MessageItem[] {
		let items: MessageItem[] = [];
		let lastAuthor: string | null = null;
		for (let i = 0; i < messages.length; i++) {
			let message = messages[i];
			items.push(message);
			if (message.type === 'message') {
				if (lastAuthor == message.author) message.hide_author = true;
			}
			lastAuthor = message.author || null;
		}
		return items;
	}

	async function mouseDown(event: MouseEvent): Promise<void> {
		//console.log('event:', event);
	}

	function onFocus(event: FocusEvent): void {
		//console.log('elMessages onFocus:', event);
		window.addEventListener('keydown', onkeydown);
	}

	function onBlur(event: FocusEvent): void {
		//console.log('elMessages onBlur:', event);
		window.removeEventListener('keydown', onkeydown);
	}

	async function onkeydown(event: KeyboardEvent): Promise<void> {
		if (event.key === 'PageUp' || event.key === 'PageDown' || event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Home' || event.key === 'End') return;
		if (event.ctrlKey || event.metaKey) return;
		await setBarFocus();
	}

	function onDragOver(e: DragEvent): void {
		e.preventDefault();
		if (!e.dataTransfer) return;
		const draggedItems = e.dataTransfer.items;
		const types = Array.from(e.dataTransfer.types || []);
		let isDraggingFiles = false;
		// In Chrome/Firefox: you can safely check item.kind
		if (draggedItems && draggedItems.length > 0) {
			for (let i = 0; i < draggedItems.length; i++) {
				if (draggedItems[i].kind === 'file') {
					isDraggingFiles = true;
					break;
				}
			}
		} else {
			// Fallback for Safari: heuristically assume files if dataTransfer.types includes 'Files'
			// This is not perfect but good enough
			const types = Array.from(e.dataTransfer?.types || []);
			if (types.includes('Files')) {
				isDraggingFiles = true;
			}
		}
		if (!isDraggingFiles) return;
		// show overlay only if file upload modal is not shown
		// but if user drops files to conversation it will still add them to the upload modal
		if (!get(modalFileUploadStore)?.isOpen() && !showFileDndOverlay) showFileDndOverlay = true;
	}

	function onDragLeave(e: DragEvent): void {
		e.preventDefault();
		// handle premature dragleave events
		if (!e.relatedTarget || !fileDndRef.contains(e.relatedTarget as Node)) showFileDndOverlay = false;
	}

	function onDrop(e: DragEvent): void {
		e.preventDefault();
		e.stopPropagation();
		if (!e.dataTransfer || e.dataTransfer.files.length === 0) return;
		showFileDndOverlay = false;
		setFileUploadModal(true);
		$fileUploadModalFiles = [...$fileUploadModalFiles, ...Array.from(e.dataTransfer.files)];
	}

	const onResize = (entry: ResizeObserverEntry): void => {
		wrapperWidth = entry.contentRect.width;
	};
	$: document.documentElement.style.setProperty('--messages-list-width', wrapperWidth + 'px');

	// Debug button handlers
	const handleSaveScrollPosition = () => {
		const event: UIEvent = { type: 'debug_save', array: [], loaders: [] };
		saveScrollPosition(event);
	};

	const handleRestoreScrollPosition = () => {
		const event: UIEvent = { type: 'debug_restore', array: [], loaders: [] };
		restoreScrollPosition(event);
	};
</script>

<!--doBlockScroll: {doBlockScroll}-->

<style>
	.spacer {
		flex-grow: 1;
	}

	.messages-fixed {
		position: relative;
		display: flex;
		flex-grow: 1;
		overflow: hidden;
		container-type: inline-size;
		container-name: messages-list;
	}

	.messages {
		display: flex;
		margin-top: auto;
		flex-direction: column;
		flex-grow: 1;
		height: 100%;
		overflow-y: auto;
		max-height: 100%; /* Ensure the inner div has a defined height */
	}

	.unread {
		display: flex;
		justify-content: center;
		background-color: var(--primary-softer-background);
		border: 1px solid var(--primary-background);
		color: var(--primary-foreground);
		padding: 10px 0;
		box-shadow: var(--shadow);
	}

	.hole {
		display: flex;
		justify-content: center;
		background-color: var(--primary-foreground);
		border: 1px solid var(--disabled-foreground);
		padding: 10px 0;
		box-shadow: var(--shadow);
		height: 30%;
		min-height: 60%;
	}

	.debug {
		z-index: 100;
		display: flex;
		flex-direction: column;
		gap: 10px;
		position: fixed;
		top: 0;
		left: 0;
		box-sizing: border-box;
		max-width: 60%;
		max-height: 100%;
		padding: 10px;
		overflow: auto;
		border: 2px solid var(--secondary-foreground);
		border-radius: 10px;
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
	}

	.no-messages {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.no-messages .body {
		background-color: var(--primary-background);
		border: 1px solid var(--primary-foreground);
		color: var(--primary-foreground);
		border-radius: 20px;
		padding: 20px;
		box-shadow: var(--shadow);
	}

	/*
 .debug-text {
  word-break: break-word;
 }
 */

	.dnd-overlay {
		z-index: 1;
		position: absolute;
		display: none;
		width: 100%;
		height: 100%;
		background-color: var(--primary-background);
		pointer-events: none;
	}

	.dnd-overlay.drop-active {
		display: flex;
	}

	.dnd-overlay-inner {
		margin: 10px;
		width: 100%;
		background-color: var(--primary-softer-background);
		border-radius: 10px;
		border: 2px dashed var(--primary-foreground);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.dnd-overlay-text {
		font-size: 28px;
		font-weight: bold;
		margin-top: 8px;
		color: var(--primary-foreground);
	}
</style>

{#if $debug}
	<div class="debug">
		<Button text="Scroll to bottom" onClick={scrollToBottom} />
		<Button text="Save scroll position" onClick={handleSaveScrollPosition} />
		<Button text="Restore scroll position" onClick={handleRestoreScrollPosition} />
		<Button text="GC" onClick={gc} />
		{#if false}<Button text="Show debug modal" onClick={() => null} />{/if}
		<div>items count: {itemsCount}</div>
		<div>messagesHeight: {messagesHeight}</div>
		<div>elMessages.scrollHeight: {elMessages?.scrollHeight}</div>
	</div>
{/if}

<svelte:window bind:innerWidth={windowInnerWidth} bind:innerHeight={windowInnerHeight} />

<div class="messages-fixed" bind:this={fileDndRef} on:dragover={onDragOver} on:drop={onDrop} on:dragleave={onDragLeave} role="region" aria-label="File drop zone" use:resize={onResize}>
	<div class="dnd-overlay {showFileDndOverlay ? 'drop-active' : ''}">
		<div class="dnd-overlay-inner">
			<Icon img="modules/{identifier}/img/file.svg" colorVariable="--primary-foreground" alt="Drop files icon" size="75px" padding="0px" />
			<div class="dnd-overlay-text">Drop files here to send them</div>
		</div>
	</div>
	{#if itemsArray.length === 0 || (itemsArray.length === 1 && itemsArray[0].type === 'no_messages')}
		<div class="spacer"></div>
		<div class="no-messages">
			{#if $online}
				{#if $messagesIsInitialLoading}
					<Spinner />
				{:else}
					<div class="body">Send a message to start a conversation</div>
				{/if}
			{:else}
				<div class="body">Module is offline, messages will be delivered later</div>
			{/if}
		</div>
		<div class="spacer"></div>
	{:else}
		<div class="messages" role="none" tabindex="-1" bind:this={elMessages} on:mousedown={mouseDown} on:focus={onFocus} on:blur={onBlur} on:scroll={parseScroll} on:touchmove={touchMove} on:touchend={blockScroll} on:touchstart={touchStart}>
			<div class="spacer"></div>
			{#each itemsArray as m (m.uid)}
				<!--{#if $debug}-->
				<!-- <div class="debug-text">-->
				<!--  {JSON.stringify(m, null, 2)}-->
				<!-- </div>-->
				<!--{/if}-->
				{#if m.type === 'no_messages' || m.type === 'initial_loading_placeholder'}{:else if m.type === 'hole' && 'top' in m && 'bottom' in m}
					<MessageLoader loader={m.top} />
					<div class="hole">{m.uid}</div>
					<MessageLoader loader={m.bottom} />
				{:else if m.type === 'loader'}
					<MessageLoader loader={m} />
				{:else if m.type === 'unseen_marker'}
					<div bind:this={elUnseenMarker} class="unread">Unread messages</div>
				{:else}
					<Message bind:this={m.el} {enableScroll} {disableScroll} message={m} elContainer={elMessages} />
				{/if}
			{/each}
			<div bind:this={anchorElement}></div>
		</div>
		<ScrollButton visible={scrollButtonVisible} right="15px" bottom="5px" onClick={scrollToBottom} />
	{/if}
</div>

<Modal bind:this={elModalStickersetDetails} title="Sticker set" body={ModalStickersetDetails} params={{ stickersetDetailsModalStickerset }} width="448px" height="390px" />
<Modal bind:this={elModalForwardMessage} testId="forward-message" title="Forward message" body={ModalForwardMessage} width="448px" height="390px" />
