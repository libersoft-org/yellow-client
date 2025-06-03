<script>
	import { onDestroy, onMount, setContext, tick } from 'svelte';
	import { hideSidebarMobile } from '@/core/core.js';
	import { get, writable } from 'svelte/store';
	import { selectedConversation } from '../../messages.js';
	import ProfileBar from '../ProfileBar/ProfileBar.svelte';
	import MessagesList from '../MessagesList/MessagesList.svelte';
	import MessageBar from '../MessageBar/MessageBar.svelte';
	let message_bar;
	let oldSelectedConversation;
	let messagesContext = {};
	setContext('MessagesContext', messagesContext);

	$: messagesContext.messageBar = message_bar;
	$: update($selectedConversation);

	let showFileUploadModal = writable(false);
	let fileUploadModalFiles = writable([]);

	async function update(selectedConversation) {
		if (selectedConversation) {
			if (oldSelectedConversation != selectedConversation) {
				oldSelectedConversation = selectedConversation;
				await setBarFocus();
			}
		}
	}

	onMount(async () => {
		console.log('conversation mounted for:', get(selectedConversation));
		window.addEventListener('keydown', onKeydown);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') window.removeEventListener('keydown', onKeydown);
	});

	function closeConversation() {
		selectedConversation.set(null);
		hideSidebarMobile.set(false);
	}

	export async function setBarFocus() {
		await tick();
		await message_bar?.setBarFocus();
	}

	async function onKeydown(event) {
		//console.log('Conversation keyDown: ', event.key);
		if (event.key === 'Escape' && get(selectedConversation)) {
			closeConversation();
			return;
		}
	}

	function setFileUploadModal(value) {
		if (value !== $showFileUploadModal) {
			fileUploadModalFiles.set([]);
		}
		showFileUploadModal.set(value);
	}

	setContext('FileUploadModal', { showFileUploadModal, fileUploadModalFiles, setFileUploadModal });
</script>

<style>
	.conversation {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
		background: var(--background-image) 0 0 / 400px repeat;
	}
</style>

<div role="none" class="conversation" onkeydown={onKeydown}>
	<ProfileBar {closeConversation} />
	<MessagesList {setBarFocus} conversation={$selectedConversation} />
	<MessageBar bind:this={message_bar} />
</div>
