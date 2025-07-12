<script lang="ts">
	import { tick } from 'svelte';
	import { openNewConversation, identifier } from '@/org.libersoft.messages/scripts/messages.js';
	import Window from '@/core/components/Window/Window.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	let elWindow;
	let addressInputRef = $state<HTMLInputElement>();
	let value = $state('');

	$effect(() => {
		if (!elWindow.isOpen() || !addressInputRef) return;
		tick().then(() => addressInputRef?.focus());
	});

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') clickOpen();
	}

	function clickOpen() {
		if (value) {
			openNewConversation(value);
			close();
		}
	}

	export function open() {
		elWindow?.open();
		tick().then(() => addressInputRef?.focus());
	}

	export function close() {
		elWindow?.close();
	}
</script>

<Window title="New conversation" bind:this={elWindow}>
	{#snippet top()}
		<Label text="Address" row>
			<Input data-testid="new-conversation-address" expand placeholder="user@domain.tld" {onKeydown} bind:inputRef={addressInputRef} bind:value />
		</Label>
	{/snippet}
	{#snippet bottom()}
		<ButtonBar expand>
			<Button data-testid="New Conversation Open" img="modules/{identifier}/img/conversation-new.svg" text="Open" onClick={clickOpen} />
			<Button img="img/cancel.svg" text="Cancel" onClick={close} />
		</ButtonBar>
	{/snippet}
</Window>
