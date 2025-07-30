<script lang="ts">
	import { get } from 'svelte/store';
	import { active_account } from '@/core/scripts/core.ts';
	import { highlightElement } from '@/core/scripts/utils/animationUtils.ts';
	import { emoji_render, rgi_to_codepoints } from '@/org.libersoft.messages/scripts/emojis.js';
	import union from 'lodash/union';
	import isEqual from 'lodash/isEqual';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Tooltip from '@/core/components/Tooltip/Tooltip.svelte';

	if (import.meta.env.VITE_YELLOW_CLIENT_DEBUG) {
		console.debug(union, isEqual);
	}

	interface Props {
		reactions: any[];
		onReactionClick: (codepoints_rgi: string) => void;
	}
	let { reactions, onReactionClick }: Props = $props();
	let tooltipButton = $state<{ ref: HTMLElement; reactions: any[] } | null>(null);
	const groupedReactions = $derived.by(() => {
		if (!reactions || !reactions.length) return {};
		const grouped = {};
		for (const reaction of reactions) {
			const codepoints_rgi = reaction.emoji_codepoints_rgi;
			if (!grouped[codepoints_rgi]) grouped[codepoints_rgi] = [];
			grouped[codepoints_rgi].push(reaction);
		}
		return grouped;
	});

	const showTooltip = (e, reactions, rgi) => {
		if (tooltipButton && tooltipButton.ref === e.target) return;
		tooltipButton = {
			reactions,
			ref: e.target,
		};
	};

	const dismissTooltip = e => {
		tooltipButton = null;
	};

	const renderInfoFromReactions = (reactions: any[]) => {
		if (!reactions || !reactions.length) return '';
		const activeAccount = get(active_account);
		if (!activeAccount) {
			console.warn('No active account available');
			return;
		}
		const myUserAddress = activeAccount.credentials.address;
		const didIReact = reactions.some(r => r.user_address === myUserAddress);
		const otherReactionAddresses = reactions.filter(r => r.user_address !== myUserAddress).map(r => r.user_address);
		const emoji = emoji_render(rgi_to_codepoints(reactions[0].emoji_codepoints_rgi));
		if (didIReact && otherReactionAddresses.length) {
			return 'You and ' + otherReactionAddresses.join(', ') + ' have reacted with ' + emoji;
		} else if (didIReact) {
			return 'You have reacted with ' + emoji;
		} else if (otherReactionAddresses.length > 1) {
			return otherReactionAddresses.join(', ') + ' have reacted with ' + emoji;
		} else if (otherReactionAddresses.length === 1) {
			return otherReactionAddresses.join('') + ' has reacted with ' + emoji;
		} else {
			return '';
		}
	};

	let prevReactions: any | null = null;
	let buttonRefs = $state({});
	/**
	 * Animations handler by detecting changes in reactions
	 */
	$effect(() => {
		if (prevReactions === null) {
			prevReactions = groupedReactions;
			return;
		}

		if (isEqual(prevReactions, groupedReactions)) return;
		// find difference by comparing groups lengths
		const prevKeys = Object.keys(prevReactions);
		const newKeys = Object.keys(groupedReactions);
		const added = newKeys.filter(key => !prevKeys.includes(key));
		const removed = prevKeys.filter(key => !newKeys.includes(key));
		const modified = newKeys.filter(key => {
			if (prevReactions[key] && groupedReactions[key]) {
				return prevReactions[key].length !== groupedReactions[key].length;
			}
			return false;
		});
		union(added, removed, modified).forEach(a => highlightElement(buttonRefs[a]));
		prevReactions = groupedReactions;
	});
</script>

<style>
	.message-reactions {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-bottom: 4px;
	}

	.reaction-box {
		flex: 0 0 auto;
		padding: 4px 8px;
		background: var(--primary-softer-background);
		border-radius: 8px;
		border: 1px solid var(--primary-foreground);
	}

	.reaction-box:hover,
	:global(.clickable:focus-visible) .reaction-box,
	:global(.clickable.focused) .reaction-box {
		background-color: var(--primary-background);
	}
</style>

{#if reactions && reactions.length}
	<div class="message-reactions">
		{#each Object.keys(groupedReactions) as rgi (rgi)}
			{@const reactions = groupedReactions[rgi]}
			<Clickable onClick={() => onReactionClick(rgi)}>
				<div bind:this={buttonRefs[rgi]} class="reaction-box" onmouseenter={e => showTooltip(e, reactions, rgi)} onmouseleave={dismissTooltip} role="button" tabindex="0">
					{emoji_render(rgi_to_codepoints(rgi))}
					<span style:pointer-events="none">{reactions.length}</span>
				</div>
			</Clickable>
		{/each}
	</div>
	{#if tooltipButton}
		<Tooltip targetRef={tooltipButton.ref}>
			<div style:max-width="120px" style:text-align="center">
				{renderInfoFromReactions(tooltipButton.reactions)}
			</div>
		</Tooltip>
	{/if}
{/if}
