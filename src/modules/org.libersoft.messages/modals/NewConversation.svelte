<script lang="ts">
	import { onMount } from 'svelte';
	import { openNewConversation } from '../messages.js';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import { m } from '@/lib/paraglide/messages.js';
	import Label from '@/core/components/Label/Label.svelte';

	interface Props {
		close: () => void;
	}

	let { close }: Props = $props();

	let addressInputRef = $state<HTMLInputElement>();
	let value = $state('');

	onMount(() => {
		addressInputRef?.focus();
	});

	function clickOpen() {
		if (value) {
			openNewConversation(value);
			close();
		}
	}

	function onSubmit(event) {
		event.preventDefault();
		clickOpen();
	}
</script>

<style>
	.group {
		display: flex;
		align-items: end;
		gap: 10px;
	}
</style>

<form onsubmit={onSubmit}>
	<div class="group">
		<Label text={`${m['messages.new_conversation.address']()}`}>
			<Input data-testid="new-conversation-address" grow placeholder="user@domain.tld" bind:inputRef={addressInputRef} bind:value />
		</Label>
		<Button data-testid="New Conversation Open" text={m['common.open']()} onClick={clickOpen} />
	</div>
</form>
