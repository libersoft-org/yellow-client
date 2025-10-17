<script lang="ts">
	import { get } from 'svelte/store';
	import { active_account } from '@/core/scripts/core.ts';
	import { jumpToMessage } from '@/org.libersoft.messages/scripts/messages.js';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	interface Props {
		address?: string;
		text?: string;
		uid?: string;
	}
	let { address, text, uid }: Props = $props();

	function clickReply() {
		let acc = get(active_account);
		jumpToMessage(acc, address, uid);
	}
</script>

<style>
	.reply {
		display: flex;
		flex-direction: column;
		padding: 4px 0 4px 10px;
		border: 1px solid var(--primary-background);
		border-radius: 10px;
		border-left: 8px solid var(--primary-background);
		margin: 0 0 5px 0;
		background-color: var(--secondary-background);
	}

	.reply .name {
		font-size: 12px;
		font-weight: bold;
		color: var(--primary-background);
	}

	.reply .text {
		color: var(--secondary-foreground);
	}

	.reply-wrap {
		flex: 1 0 100%;
		margin-bottom: 2px;
	}
</style>

<div class="reply-wrap">
	<Clickable onClick={clickReply}>
		<div class="reply">
			<div class="name">{address}</div>
			<div class="text">{text}</div>
		</div>
	</Clickable>
</div>
