<script>
	import SidebarItem from '@/core/components/Sidebar/SidebarItem.svelte';
	import Photo from '@/core/components/Photo/Photo.svelte';
	import { selectedConversation, ensureConversationDetails, photoRadius } from '../../messages.js';
	export let c;
	export let clickItem;

	$: ensureConversationDetails(c);
	let testid;
	$: testid = 'conversation ' + c.address;
</script>

<style>
	.item {
		display: flex;
		flex-direction: column;
	}

	.item .item-row {
		display: flex;
		flex-direction: row;
	}

	.item .item-row .description {
		word-break: break-word;
		flex-grow: 1;
		padding: 0 10px;
		overflow: hidden;
		/* width: fit-content; */
	}

	.item .item-row .description .name {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		font-weight: bold;
	}

	.item .item-row .description .address,
	.item .item-row .description .time {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		font-size: 12px;
	}

	.item .text {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		margin-top: 8px;
		color: var(--primary-foreground);
		font-size: 14px;
	}

	.item .item-row .count {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		border-radius: 50%;
		font-size: 13px;
		font-weight: bold;
		background-color: var(--primary-harder-background);
		color: var(--primary-foreground);
	}
</style>

<SidebarItem data-testid={testid} active={c.address === $selectedConversation?.address} onClick={() => clickItem(c)}>
	<div class="item">
		<div class="item-row">
			<Photo size="50px" radius={$photoRadius} />
			<div class="description">
				<div class="contact">
					{#if c.visible_name}
						<div class="name">{c.visible_name}</div>
					{/if}
					<div class="address">{c.address}</div>
					<div class="time">
						{new Date(c.last_message_date /*.replace(' ', 'T') + 'Z'*/).toLocaleString()}
					</div>
				</div>
			</div>
			{#if c.unread_count !== 0 && c.unread_count !== undefined}
				<div class="count">{c.unread_count}</div>
			{/if}
		</div>
		{#if c.last_message_text.trim()}
			<div class="text">{c.last_message_text.trim()}</div>
		{:else}
			<div class="text">&nbsp;</div>
		{/if}
	</div>
</SidebarItem>
