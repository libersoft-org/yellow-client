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

	/* Expressions menu state (Android only). Exposed as a store rather than a mutable callback:
	 * consumers used to overwrite setOpen with their own wrapper and never restore it, so every
	 * remount wrapped the previous wrapper and pinned a destroyed component's state. */
	const expressionsMenuOpenStore = writable(false);
	setContext('expressionsMenuOpen', {
		open: expressionsMenuOpenStore,
		setOpen: (open: boolean) => expressionsMenuOpenStore.set(open),
	});
	setContext('FileUploadWindow', { fileUploadWindowFiles, setFileUploadWindow });
</script>

<Content>
	<span hidden aria-hidden="true">{_syncMessageBar}{_syncConversation}</span>
	<ProfileBar {closeConversation} />
	<MessagesList {setBarFocus} conversation={$selectedConversation} />
	<MessageBar bind:this={message_bar} />
</Content>
