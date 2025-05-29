<script>
	import BaseButton from '@/core/components/Button/BaseButton.svelte';
	import { jumpToMessage } from '../../messages.js';
	import { get } from 'svelte/store';
	import { active_account } from '@/core/core.js';
	export let address = '';
	export let text = '';
	export let uid = '';

	function clickReply() {
		let acc = get(active_account);
		jumpToMessage(acc, address, uid);
	}
</script>

<div class="reply-wrap">
	<BaseButton onClick={clickReply}>
		<div class="reply">
			<div class="name">{address}</div>
			<div class="text">{text}</div>
		</div>
	</BaseButton>
</div>

<style>
	.reply {
		display: flex;
		flex-direction: column;
		padding: 4px 0 4px 10px;
		border: 1px solid #080;
		border-radius: 10px;
		border-left: 8px solid #080;
		margin: 0 0 5px 0;
	}

	.reply .name {
		font-size: 12px;
		font-weight: bold;
		color: #080;
	}

	.reply .text {
		color: #555;
	}

	.reply-wrap {
		flex: 1 0 100%;
		margin-bottom: 2px;
	}
</style>
