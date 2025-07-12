<script>
	import { onMount, setContext, tick, getContext } from 'svelte';
	import { documentHeight, keyboardHeight, isMobile, debug } from '@/core/stores.ts';
	import { handleResize, identifier, initUpload, sendMessage, selectedConversation } from '../../messages.js';
	import Bar from '@/core/components/Content/ContentBar.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import ContextMenu from '@/core/components/ContextMenu/ContextMenu.svelte';
	import ContextMenuItem from '@/core/components/ContextMenu/ContextMenuItem.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ModalFileUpload from '../../modals/FileUpload.svelte';
	import ModalHtml from '../../modals/Html.svelte';
	import Expressions from '../Expressions/Expressions.svelte';
	import { init_emojis } from '../../emojis.js';
	import { get } from 'svelte/store';
	import MessageBarRecorder from './MessageBarRecorder.svelte';
	import audioRecorderStore from '@/org.libersoft.messages/stores/AudioRecorderStore.ts';
	import MessageBarReply from '@/org.libersoft.messages/components/MessageBar/MessageBarReply.svelte';
	import messageBarReplyStore, { ReplyToType } from '@/org.libersoft.messages/stores/MessageBarReplyStore.ts';
	import { FileUploadRecordType } from '@/org.libersoft.messages/services/Files/types.ts';
	import VideoRecorderContainer from '../VideoRecorder/VideoRecorderContainer.svelte';
	import { modalFileUploadStore } from '@/org.libersoft.messages/stores/FileUploadStore.ts';
	let expressionsMenu;
	let elBottomSheet;
	let elAttachment;
	let elExpressions;
	let elMessage;
	let elMessageBar;
	let elModalVideoRecorder;
	let elModalHTML;
	let text;
	let expressions;
	let expressionsHeight = '500px';
	let expressionsBottomSheetOpen = false;
	let expressionsAsContextMenu = true;
	let lastDocumentHeight = 0;
	let videoInputRef;
	let showVideoRecorder = false;
	let pendingBottomSheetOpen = false;
	let waitingForKeyboardClose = false;

	isMobile.subscribe(value => {
		expressionsAsContextMenu = !value;
		expressionsHeight = value ? '250px' : '500px';
	});

	let { setFileUploadModal } = getContext('FileUploadModal');
	let expressionsMenuOpen = getContext('expressionsMenuOpen');

	documentHeight.subscribe(value => {
		if (value != lastDocumentHeight) {
			//if (value < lastDocumentHeight - 100) expressionsBottomSheetOpen = false;
			lastDocumentHeight = value;
		}
	});

	onMount(async () => {
		console.log('MessageBar mounted');
		await init_emojis();
		/*setInterval(() => {
   let v = get(debugBuffer);
   if (v == '') return;
   v = v.substring(0, 65500);
   doSendMessage(v, false);
   debugBuffer.set('');
  }, 10000);*/
	});

	setContext('MessageBar', {
		sendMessageHtml: text => doSendMessage(text, true),
		sendMessagePlain: text => doSendMessage(text, false),
		insertText,
		setBarFocus,
		append: message => {
			elMessage.value += message;
			resizeMessage();
		},
	});

	export async function openExpressions(tab) {
		console.log('openExpressions', tab);
		if (expressionsAsContextMenu) {
			console.log('openExpressions as context menu:', expressionsMenu);
			console.log('elExpressions.offsetLeft:', elExpressions.offsetLeft, 'elExpressions.offsetTop:', elExpressions.offsetTop, 'elExpressions.offsetWidth:', elExpressions.offsetWidth, 'elExpressions.offsetHeight:', elExpressions.offsetHeight);
			expressionsMenu?.openMenu({ x: elExpressions.getBoundingClientRect().x, y: 0 });
			// Notify MessagesList that expressions menu is open
			expressionsMenuOpen?.setOpen(true);
		} else {
			// Use delay-based opening for mobile bottom sheet
			handleBottomSheetOpenWithDelay();
		}
		await tick();
		console.log('elExpressions:', elExpressions);
		await expressions?.setCategory(null, tab);
	}

	export async function insertText(text) {
		/* insert text at the current cursor position */
		//console.log('elMessage.selectionStart:', elMessage.selectionStart);
		const start = elMessage.selectionStart;
		const end = elMessage.selectionEnd;
		elMessage.value = elMessage.value.substring(0, start) + text + elMessage.value.substring(end);
		resizeMessage();
		//if (expressionsBottomSheetOpen) return;
		elMessage.selectionStart = start + text.length;
		elMessage.selectionEnd = start + text.length;
		//console.log('elMessage.selectionStart:', elMessage.selectionStart);
		setBarFocus();
	}

	let lastSentMessageUid = null;

	export async function doSendMessage(message, html) {
		//console.log('doSendMessage', message);
		const uid = await sendMessage(message, html ? 'html' : 'plaintext');
		lastSentMessageUid = uid;
		await setBarFocus();
		closeExpressions();
	}

	export async function setBarFocus() {
		if (expressionsBottomSheetOpen) return;
		await tick();
		//console.log('setBarFocus');
		if (elMessage) elMessage.focus();
	}

	function resizeMessage() {
		console.log('resizeMessage handleResize (scroll?)');
		handleResize(true /*TODO: save*/);
		const maxHeight = 200;
		const textarea = elMessage;
		textarea.style.height = 'auto'; // ?
		textarea.style.height = (textarea.scrollHeight < maxHeight ? textarea.scrollHeight : maxHeight) + 'px';
		if (elMessage.scrollHeight > maxHeight) elMessage.style.overflowY = 'scroll';
		else elMessage.style.overflowY = 'hidden';
	}

	export function dispatchEvent(event) {
		text = event.key;
	}

	const isMessageReplyOpen = messageBarReplyStore.isOpen();
	const replyTo = messageBarReplyStore.getReplyTo();

	function clickSend(event) {
		clickSend2(elMessage.value);
	}

	function clickSend2(messageToSend) {
		if (messageToSend && $replyTo && $replyTo.type === ReplyToType.MESSAGE) {
			const replyToMessageUid = $replyTo?.data?.uid;
			messageToSend = `<Reply id="${replyToMessageUid}"></Reply>${messageToSend}`;
			doSendMessage(messageToSend, true);
		} else if (messageToSend) {
			doSendMessage(messageToSend, false);
		}
		elMessage.value = '';
		resizeMessage(event);
		elMessage.focus();
		messageBarReplyStore.close();
	}

	function debugClickSendSplit(event) {
		setTimeout(() => {
			let messages = elMessage.value.split('\n');
			for (let message of messages) {
				if (message) {
					clickSend2(message);
				}
			}
		}, 5000);
	}

	function onKeyDown(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			clickSend(event);
		}
		if (event.key === 'Escape') {
			if (expressionsBottomSheetOpen || (expressionsMenu && get(expressionsMenu.isOpen))) {
				event.preventDefault();
				event.stopPropagation();
				closeExpressions();
			}
		}
	}

	function onMessageInputFocus(event) {
		console.log('📝 Message input focused - closing bottom sheet');
		// Close bottom sheet when user wants to type
		if (expressionsBottomSheetOpen) {
			expressionsBottomSheetOpen = false;
			expressionsMenuOpen?.setOpen(false);
		}
		// Also clear any pending opening
		pendingBottomSheetOpen = false;
		waitingForKeyboardClose = false;
	}

	function clickRecord(event) {
		console.log('clicked on record mic / camera - long press to record, short press to switch mic / camera');
	}

	function sendHTML() {
		elModalHTML?.open();
	}

	function sendLocation() {
		console.log('clicked on location');
	}

	isMobile.subscribe(value => {
		expressionsAsContextMenu = !value;
	});

	documentHeight.subscribe(value => {
		console.log('documentHeight handleResize (scroll?)');
		handleResize(true); // TODO: save wasScrolledToBottom2 before showing bottom sheet /// periodically?
	});

	keyboardHeight.subscribe(value => {
		console.log('keyboardHeight:', value);
		if (value > 100) {
			if (get(isMobile)) {
				console.log('adjusting expressionsHeight from keyboardHeight:', value);
				expressionsHeight = value + 'px';
			}
		}

		// Check if we're waiting for keyboard to close and it's now closed
		if (waitingForKeyboardClose) {
			console.log('🔍 WAITING FOR KEYBOARD - current height:', value, 'waiting:', waitingForKeyboardClose);
			if (!value || value < 50) {
				console.log('🎉 *** KEYBOARD CLOSED *** - opening bottom-sheet now');
				waitingForKeyboardClose = false;
				pendingBottomSheetOpen = false;
				expressionsBottomSheetOpen = true;
				expressionsMenuOpen?.setOpen(true);
			}
		}
	});

	$: expressionsAsContextMenuUpdate(expressionsAsContextMenu);
	function expressionsAsContextMenuUpdate(expressionsAsContextMenu) {
		closeExpressions();
	}

	function closeExpressions() {
		//console.log('closeExpressions');
		//if (expressionsBottomSheetOpen) handleResize(true); // TODO: save wasScrolledToBottom2 before showing bottom sheet
		expressionsBottomSheetOpen = false;
		expressionsMenu?.close();
		// Clear any pending opening
		pendingBottomSheetOpen = false;
		waitingForKeyboardClose = false;
		// Notify MessagesList that expressions menu is closed
		expressionsMenuOpen?.setOpen(false);
	}

	$: update2(expressionsAsContextMenu, expressionsBottomSheetOpen);
	function update2(expressionsAsContextMenu, expressionsBottomSheetOpen) {
		// Removed auto-blur to prevent interference with delay logic
		// The blur is now handled manually in handleBottomSheetOpenWithDelay
	}

	function elMessageBlur(event) {
		//console.log('elMessageBlur');
		if (elBottomSheet?.contains(event.relatedTarget)) return;

		// Don't close if we have a pending bottom sheet opening
		if (pendingBottomSheetOpen || waitingForKeyboardClose) {
			console.log('🔄 Not closing bottom sheet - pending opening in progress');
			return;
		}

		expressionsBottomSheetOpen = false;
		// Notify MessagesList that expressions menu is closed (bottom sheet)
		expressionsMenuOpen?.setOpen(false);
	}

	const onVideoRecordClick = async () => {
		videoInputRef.click();
	};

	// Reactive bottom sheet opening - waits for keyboard to actually close
	function handleBottomSheetOpenWithDelay() {
		console.log('🚀 handleBottomSheetOpenWithDelay called');

		// Prevent multiple simultaneous requests
		if (pendingBottomSheetOpen || waitingForKeyboardClose) {
			console.log('🚫 Bottom sheet opening already pending');
			return;
		}

		const currentKeyboardHeight = get(keyboardHeight);
		const currentIsMobile = get(isMobile);
		console.log('🔍 DEBUG - keyboardHeight:', currentKeyboardHeight, 'isMobile:', currentIsMobile, 'expressionsAsContextMenu:', expressionsAsContextMenu);

		// If keyboard is not open, open bottom sheet immediately
		if (!currentKeyboardHeight || currentKeyboardHeight < 50) {
			console.log('✅ Taking IMMEDIATE path - keyboard not detected as open');
			console.log('📱 Opening bottom sheet immediately');
			expressionsBottomSheetOpen = true;
			expressionsMenuOpen?.setOpen(true);
			return;
		}

		// Keyboard is open - close it first, then wait for it to actually close
		console.log('⌨️ Taking REACTIVE path - keyboard detected as open');
		console.log('🔄 Setting waitingForKeyboardClose = true, waiting for keyboard to close...');
		waitingForKeyboardClose = true;
		pendingBottomSheetOpen = true;
		elMessage.blur(); // Start closing keyboard

		// The keyboardHeight subscriber will handle opening the bottom sheet
		// when the keyboard actually closes (height becomes 0)
	}

	onMount(() => {
		videoInputRef.addEventListener('change', function (event) {
			console.log('event.target.files', event.target.files);
			const recipientEmail = get(selectedConversation).address;
			const file = event.target.files[0]; // Get the selected video file
			if (file) {
				// const url = URL.createObjectURL(file); // Create a URL for the video file
				// videoPreview.src = url;
				// videoPreview.style.display = "block"; // Show the preview of the video
				initUpload([file], FileUploadRecordType.SERVER, [recipientEmail]);
			}
		});
	});
</script>

<style>
	.message-bar {
		display: flex;
		flex-direction: column;
		gap: 10px;
		flex-grow: 1;
		height: 100%;
	}

	.top {
		display: flex;
		flex-grow: 1;
	}

	.main {
		display: flex;
		align-items: end;
		gap: 10px;
		flex-grow: 1;
	}

	.message-textarea {
		flex-grow: 1;
		width: 100%;
		padding: 5px;
		border: 0;
		border-bottom: 2px solid var(--secondary-foreground);
		outline: none;
		resize: none;
		overflow-y: auto;
		box-sizing: border-box;
		font-family: inherit;
		font-size: 16px;
		background-color: transparent;
		color: var(--secondary-foreground);
	}

	.bottom-sheet {
		border-radius: 10px;
		border: 10px solid var(--primary-foreground);
	}

	.video-recorder-wrapper {
		overflow: hidden;
		transition: max-height 0.3s ease-in-out;
		max-height: 0;
		display: flex;
		flex-direction: column;
	}

	.video-recorder-wrapper.open {
		min-height: calc(100vh - 153px);
		height: calc(100vh - 153px);
		padding-bottom: 2rem;
	}
</style>

<Bar position="bottom" height="auto" bind:element={elMessageBar}>
	<div class="message-bar" data-sent-message-uid={lastSentMessageUid}>
		{#if showVideoRecorder}
			<div class="video-recorder-wrapper open">
				<VideoRecorderContainer />
			</div>
		{/if}
		<input type="file" id="videoInput" style:display="none" accept="video/*" capture="camera" bind:this={videoInputRef} />
		{#if $isMessageReplyOpen && $replyTo && $replyTo.type === ReplyToType.MESSAGE}
			<div class="top">
				<MessageBarReply name={$replyTo?.data?.address_to} replyToMessage={$replyTo?.data?.message} onClose={() => messageBarReplyStore.close()} />
			</div>
		{/if}
		<div class="main">
			<MessageBarRecorder />
			<div bind:this={elAttachment} data-testid="attachment-button">
				<Icon img="modules/{identifier}/img/attachment.svg" colorVariable="--primary-background" alt="Attachment" size="32px" padding="0px" isButton />
			</div>
			{#if expressionsAsContextMenu}
				<div bind:this={elExpressions} class="expressions-button">
					<Icon img="modules/{identifier}/img/emoji.svg" colorVariable="--primary-background" alt="Emoji" size="32px" padding="0px" isButton />
				</div>
			{:else}
				<div class="expressions-button">
					<Icon
						img="modules/{identifier}/img/emoji.svg"
						colorVariable="--primary-background"
						alt="Emoji"
						size="32px"
						padding="0px"
						onClick={() => {
							if (expressionsBottomSheetOpen) {
								// Close bottom sheet immediately
								expressionsBottomSheetOpen = false;
								expressionsMenuOpen?.setOpen(false);
							} else {
								// Smart opening with keyboard delay
								handleBottomSheetOpenWithDelay();
							}
						}}
					/>
				</div>
			{/if}
			<textarea data-testid="message-input" id="message-input" class="message-textarea" bind:value={text} bind:this={elMessage} rows="1" placeholder="Enter your message ..." on:input={resizeMessage} on:keydown={onKeyDown} on:blur={elMessageBlur} on:focus={onMessageInputFocus}></textarea>
			<!--<Icon img="modules/{identifier}/img/video_message.svg" alt="Record video message" size="32px" padding="0px" onClick={onVideoRecordClick} />-->
			{#if !elMessage?.value}
				<Icon img="modules/{identifier}/img/video-message.svg" colorVariable="--primary-background" alt="Record video message" size="32px" padding="0px" onClick={() => (showVideoRecorder = !showVideoRecorder)} />
				<Icon img="modules/{identifier}/img/mic.svg" colorVariable="--primary-background" alt="Record voice message" size="32px" padding="0px" onClick={() => audioRecorderStore.setOpen(true)} />
			{:else}
				<Icon testId="messagebarsend" img="modules/{identifier}/img/send.svg" colorVariable="--primary-background" alt="Send" size="32px" padding="0px" onClick={clickSend} />
			{/if}
			{#if $debug}
				<Icon img="modules/{identifier}/img/send.svg" colorVariable="--primary-background" alt="Send" size="20px" padding="0px" onClick={debugClickSendSplit} />
			{/if}
		</div>
	</div>
</Bar>
<ContextMenu target={elAttachment} disableRightClick bottomOffset={elMessageBar?.getBoundingClientRect().height}>
	<ContextMenuItem img="modules/{identifier}/img/video_message-black.svg" label="Video message" onClick={onVideoRecordClick} />
	<ContextMenuItem img="modules/{identifier}/img/file.svg" label="File" onClick={() => setFileUploadModal(true)} data-testid="file-attachment-button" />
	<ContextMenuItem img="modules/{identifier}/img/html.svg" label="HTML" onClick={sendHTML} />
	<ContextMenuItem img="modules/{identifier}/img/map.svg" label="Location" onClick={sendLocation} />
</ContextMenu>
{#if expressionsAsContextMenu}
	<ContextMenu bind:this={expressionsMenu} target={elExpressions} width="380px" height={expressionsHeight} scrollable={false} disableRightClick bottomOffset={elMessageBar?.getBoundingClientRect().height}>
		<Expressions bind:this={expressions} height={expressionsHeight} />
	</ContextMenu>
{/if}
{#if $debug}
	<Clickable
		onClick={() => {
			expressionsAsContextMenu = !expressionsAsContextMenu;
			console.log('expressionsAsContextMenu:', expressionsAsContextMenu, 'expressionsBottomSheetOpen:', expressionsBottomSheetOpen);
		}}
	>
		expressionsBottomSheetOpen: {expressionsBottomSheetOpen}
		expressionsAsContextMenu: {expressionsAsContextMenu}
	</Clickable>
{/if}

{#if !expressionsAsContextMenu && expressionsBottomSheetOpen}
	<div class="bottom-sheet" style="height: {expressionsHeight};" bind:this={elBottomSheet}>
		<Expressions bind:this={expressions} height={expressionsHeight} isBottomSheet />
	</div>
{/if}

<Modal title="File upload" body={ModalFileUpload} params={{ setFileUploadModal: setFileUploadModal }} bind:this={$modalFileUploadStore} />
<Modal title="HTML composer" body={ModalHtml} bind:this={elModalHTML} width="700px" height="500px" max resizable />
