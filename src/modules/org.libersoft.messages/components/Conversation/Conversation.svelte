<script>
	import { setContext, tick } from 'svelte';
	import { get, writable } from 'svelte/store';
	import { selectedConversation, closeConversation } from '@/org.libersoft.messages/scripts/messages.js';
	import Content from '@/core/components/Content/Content.svelte';
	import ProfileBar from '@/org.libersoft.messages/components/ProfileBar/ProfileBar.svelte';
	import MessagesList from '@/org.libersoft.messages/components/MessagesList/MessagesList.svelte';
	import MessageBar from '@/org.libersoft.messages/components/MessageBar/MessageBar.svelte';
	import { windowFileUploadStore } from '@/org.libersoft.messages/stores/FileUploadStore.ts';
	let message_bar;
	let oldSelectedConversation;
	let messagesContext = {};
	let fileUploadWindowFiles = writable([]);

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

	function setFileUploadWindow(value) {
		if (!!value !== get(windowFileUploadStore)?.isOpen()) fileUploadWindowFiles.set([]);
		if (value) {
			get(windowFileUploadStore)?.open();
		} else {
			get(windowFileUploadStore)?.close();
		}
	}

	// Set up context for expressions menu state (Android only)
	let expressionsMenuOpen = false;
	setContext('expressionsMenuOpen', {
		setOpen: open => {
			expressionsMenuOpen = open;
		},
	});
	setContext('FileUploadWindow', { fileUploadWindowFiles, setFileUploadWindow });
</script>

<Content>
	<ProfileBar {closeConversation} />
	<MessagesList {setBarFocus} conversation={$selectedConversation} />
	<MessageBar bind:this={message_bar} />
</Content>
