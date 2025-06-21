<script>
	import { setContext, tick } from 'svelte';
	import { writable } from 'svelte/store';
	import { selectedConversation, closeConversation } from '../../messages.js';
	import Content from '@/core/components/Content/Content.svelte';
	import ProfileBar from '../ProfileBar/ProfileBar.svelte';
	import MessagesList from '../MessagesList/MessagesList.svelte';
	import MessageBar from '../MessageBar/MessageBar.svelte';
	let message_bar;
	let oldSelectedConversation;
	let messagesContext = {};
	let showFileUploadModal = writable(false);
	let fileUploadModalFiles = writable([]);

	setContext('MessagesContext', messagesContext);

	$: messagesContext.messageBar = message_bar;
	$: update($selectedConversation);

	async function update(selectedConversation) {
		if (selectedConversation) {
			if (oldSelectedConversation != selectedConversation) {
				oldSelectedConversation = selectedConversation;
				await setBarFocus();
			}
		}
	}

	export async function setBarFocus() {
		await tick();
		await message_bar?.setBarFocus();
	}

	function setFileUploadModal(value) {
		if (value !== $showFileUploadModal) fileUploadModalFiles.set([]);
		showFileUploadModal.set(value);
	}

	setContext('FileUploadModal', { showFileUploadModal, fileUploadModalFiles, setFileUploadModal });
</script>

<Content>
	<ProfileBar {closeConversation} />
	<MessagesList {setBarFocus} conversation={$selectedConversation} />
	<MessageBar bind:this={message_bar} />
</Content>
