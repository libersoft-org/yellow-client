<script>
	import { active_account } from '@/core/scripts/core.ts';
	import { isMobile, debug } from '@/core/scripts/stores.ts';
	import { getContext } from 'svelte';
	import { get } from 'svelte/store';
	import Emoji from './Emoji.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import { emojisLoading, emojiGroups, emojisByCodepointsRgi } from '@/org.libersoft.messages/scripts/messages.js';
	import { start_emojisets_fetch, emoji_render } from '@/org.libersoft.messages/scripts/emojis.js';
	import ContextMenu from '@/core/components/ContextMenu/ContextMenu.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import FuzzySearch from 'fuzzy-search';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	import { longpress } from '@/org.libersoft.messages/scripts/ui.js';
	import IntersectionObserver from 'svelte-intersection-observer';
	export let onEmojiClick;
	const MessageBar = getContext('MessageBar');
	let alts = [];
	let altsMenu;
	let elContainer;
	let elSearchInput;
	let search = '';
	let results;
	let intersectedElements = {};

	$: results = find($emojiGroups, search);

	function find(groups, search) {
		console.log('find:', search);
		if (!groups) return [];
		if (!search) return null;
		let all = {};
		for (let group of groups) {
			for (let emoji of group.emoji) {
				all[emoji.codepoints_rgi] = emoji;
			}
		}
		all = Object.values(all);
		let res = new FuzzySearch(all, ['shortcodes', 'emoticons'], {
			caseSensitive: false,
			sort: true,
		}).search(search);
		console.log('find:', res);
		return res;
	}

	export function onShow() {
		console.log('emojis onShow');
		if (!get(isMobile)) {
			elSearchInput?.focus?.();
		}
		if ($emojiGroups.length === 0) {
			start_emojisets_fetch(get(active_account), emojisLoading, emojiGroups, emojisByCodepointsRgi);
		}
	}

	function clickEmoji(codepoints) {
		if (typeof onEmojiClick === 'function') {
			onEmojiClick(codepoints);
		} else {
			// TODO: this should be handled by prop passing for better separation of concerns
			MessageBar.insertText(emoji_render(codepoints));
		}
	}

	function clickEmojiAndClose(codepoints) {
		clickEmoji(codepoints);
		altsMenu.close();
	}

	function showAlts(e, emoji) {
		console.log('showAlts:', emoji);
		e.preventDefault();
		alts = emoji.alternates;
		if (alts.length === 0) {
			altsMenu.close();
			return;
		}
		altsMenu.openMenu(e);
	}
</script>

<style>
	.filter {
		padding: 10px;
	}

	.emojiset {
		height: calc(100% - 105px);
		overflow: auto;
	}

	.group:first-of-type {
		.title {
			margin-top: 0;
		}
	}

	.group .title {
		font-size: 16px;
		text-align: center;
		font-weight: bold;
		padding: 8px;
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
		border-radius: 10px;
		margin: 16px 10px;
	}

	.emojis {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		padding: 0 10px;
		overflow: visible;
	}

	.emoji {
		display: flex;
		padding: 3px;
		border-radius: 10px;
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
		background-color: var(--primary-softer-background);
		border: 1px solid var(--secondary-softer-background);
	}

	.emoji.hover:hover,
	:global(.clickable:focus-visible) .emoji,
	:global(.clickable.focused) .emoji {
		z-index: 51;
		transform: scale(1.5);
		background-color: var(--primary-soft-background);
	}
</style>

{#if $debug}
	<pre>
  $emojisLoading: {$emojisLoading}
  $emojiGroups.length: {$emojiGroups.length}
  search: {search}
  results.length: {results?.length}
 </pre>
{/if}

<div class="filter">
	<Input icon={{ img: 'img/search.svg', alt: 'Search' }} bind:this={elSearchInput} bind:value={search} placeholder="Search ..." />
</div>
{#snippet clickable_emoji(emoji)}
	<IntersectionObserver once element={intersectedElements[emoji.codepoints_rgi]} let:intersecting>
		<Clickable onRightClick={e => showAlts(e, emoji)}>
			<div
				bind:this={intersectedElements[emoji.codepoints_rgi]}
				class="emoji hover"
				use:longpress
				on:longpress={e => showAlts(e, emoji)}
				on:mymousedown={() => {
					altsMenu.close();
				}}
				on:click={() => clickEmoji(emoji.base)}
				on:keydown={e => {}}
				role="button"
				tabindex="0"
			>
				{#if intersecting}
					<Emoji codepoints={emoji.base} context={'menu'} is_single />
				{/if}
			</div>
		</Clickable>
	</IntersectionObserver>
{/snippet}
<div class="emojiset" bind:this={elContainer} tabindex="-1">
	{#if $emojisLoading}
		<Spinner />
	{:else if search}
		{#if results.length === 0}
			<div>No emojis found</div>
		{:else}
			<div class="group">
				<div class="emojis">
					{#each results as emoji (emoji.codepoints_rgi)}
						{@render clickable_emoji(emoji)}
					{/each}
				</div>
			</div>
		{/if}
	{:else}
		{#each $emojiGroups as g (g.group)}
			<div class="group">
				<div class="title">{g.group}</div>
				<div class="emojis">
					{#each g.emoji as emoji (emoji.codepoints_rgi)}
						{@render clickable_emoji(emoji)}
					{/each}
				</div>
			</div>
		{/each}
	{/if}
</div>
<ContextMenu bind:this={altsMenu} scrollable={false}>
	<div class="emojis">
		{#each alts as e (e)}
			<Clickable
				onClick={() => {
					() => clickEmojiAndClose(e);
				}}
			>
				<div class="emoji hover">
					<Emoji codepoints={e} context={'menu'} is_single />
				</div>
			</Clickable>
		{/each}
	</div>
</ContextMenu>
