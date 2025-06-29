<script lang="ts">
	import { truncateTextEnd } from '@/core/utils/textUtils';
	import Icon from '@/core/components/Icon/Icon.svelte';
	interface Props {
		name: string;
		replyToMessage: string;
		onClose: () => void;
	}
	let { name, replyToMessage, onClose }: Props = $props();
</script>

<style>
	.reply-wrap {
		display: flex;
		align-items: center;
		flex: 1;
	}

	.content {
		display: flex;
		flex-grow: 1;
		flex-direction: column;
	}

	.content .heading {
		display: flex;
		gap: 5px;
		font-size: 16px;
		margin-bottom: 4px;
	}

	.content .message {
		font-size: 12px;
		text-overflow: ellipsis;
		overflow: hidden;
		color: var(--disabled-foreground);
	}
</style>

<div class="reply-wrap">
	<div class="content">
		<div class="heading">
			<div>Replying to:</div>
			<div class="bold">{name}</div>
		</div>
		<div class="message">{truncateTextEnd(replyToMessage, 70)}</div>
	</div>
	<Icon img="img/cross.svg" alt="Close" colorVariable="--secondary-foreground" onClick={onClose} size="24px" padding="0px" />
</div>
