<script lang="ts">
	import { tick } from 'svelte';
	import { openNewConversation, identifier } from '../messages.js';
	import { m } from '@/lib/paraglide/messages.js';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	let elModal;
	let addressInputRef = $state<HTMLInputElement>();
	let value = $state('');

	$effect(() => {
		if (!elModal.isOpen() || !addressInputRef) return;
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
		elModal?.open();
		tick().then(() => addressInputRef?.focus());
	}

	export function close() {
		elModal?.close();
	}
</script>

<Modal title="New conversation" bind:this={elModal}>
	{#snippet top()}
		<Label text={m['messages.new_conversation.address']()} row>
			<Input data-testid="new-conversation-address" expand placeholder="user@domain.tld" {onKeydown} bind:inputRef={addressInputRef} bind:value />
		</Label>
	{/snippet}
	{#snippet bottom()}
		<ButtonBar expand>
			<Button data-testid="New Conversation Open" img="modules/{identifier}/img/conversation-new.svg" text={m['common.open']()} onClick={clickOpen} />
			<Button img="img/cancel.svg" text="Cancel" onClick={close} />
		</ButtonBar>
	{/snippet}
</Modal>
