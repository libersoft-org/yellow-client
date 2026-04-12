<script lang="ts">
	import { setContext, tick } from 'svelte';
	import { get, writable } from 'svelte/store';
	import { selectedConversation, closeConversation } from '@/org.libersoft.messages/scripts/messages.ts';
	import Content from '@/core/components/Content/Content.svelte';
	import ProfileBar from '@/org.libersoft.messages/components/ProfileBar/ProfileBar.svelte';
	import MessagesList from '@/org.libersoft.messages/components/MessagesList/MessagesList.svelte';
	import MessageBar from '@/org.libersoft.messages/components/MessageBar/MessageBar.svelte';
	import { windowFileUploadStore } from '@/org.libersoft.messages/stores/FileUploadStore.ts';
	let message_bar = $state<any>(undefined);
	let oldSelectedConversation: any;
	let messagesContext: any = {};
	let fileUploadWindowFiles = writable<any[]>([]);

	setContext('MessagesContext', messagesContext);

	let _syncMessageBar = $derived.by((): boolean => {
		messagesContext.messageBar = message_bar;
		return true;
	});
	let _syncConversation = $derived.by((): boolean => {
		update($selectedConversation);
		return true;
	});

	async function update(selectedConv: any): Promise<void> {
		if (selectedConv) {
			if (oldSelectedConversation != selectedConv) {
				oldSelectedConversation = selectedConv;
				await setBarFocus();
			}
		}
	}

	export async function setBarFocus(): Promise<void> {
		await tick();
		await message_bar?.setBarFocus();
	}

	function setFileUploadWindow(value: any): void {
		if (!!value !== get(windowFileUploadStore)?.isOpen()) fileUploadWindowFiles.set([]);
		if (value) get(windowFileUploadStore)?.open();
		else get(windowFileUploadStore)?.close();
	}

	// Set up context for expressions menu state (Android only)
	setContext('expressionsMenuOpen', {
		setOpen: (_open: boolean) => {
			// State tracked by context consumers
		},
	});
	setContext('FileUploadWindow', { fileUploadWindowFiles, setFileUploadWindow });
</script>

<Content>
	<span hidden aria-hidden="true">{_syncMessageBar}{_syncConversation}</span>
	<ProfileBar {closeConversation} />
	<MessagesList {setBarFocus} conversation={$selectedConversation} />
	<MessageBar bind:this={message_bar} />
</Content>
