<script lang="ts">
	import { playAudio } from '@/core/scripts/notifications.ts';
	import { computePosition, autoPlacement, autoUpdate, shift, offset } from '@floating-ui/dom';
	import { onDestroy, onMount } from 'svelte';
	import { toggleMessageReaction, identifier } from '@/org.libersoft.messages/scripts/messages.js';
	import { rgi } from '@/org.libersoft.messages/scripts/emojis.js';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Portal from '@/core/components/Portal/Portal.svelte';
	import Emojis from '../Emoji/Emojis.svelte';
	import Emoji from '../Emoji/Emoji.svelte';
	interface Props {
		message: any;
	}
	let { message }: Props = $props();
	let buttonRef: HTMLElement;
	let floatingRef = $state<HTMLElement>();
	let show = $state(false);
	let showFull = $state(false);
	let autoPlacementCleanup: ReturnType<typeof handleFloatingUI>;
	const onClick = () => {
		show = !show;
	};

	const handleOutsideClick = (e: MouseEvent) => {
		if (floatingRef && !floatingRef.contains(e.target as Node) && !buttonRef.contains(e.target as Node)) {
			show = false;
			document.removeEventListener('click', handleOutsideClick);
		}
	};

	const handleFloatingUI = () => {
		if (!buttonRef || !floatingRef) {
			return;
		}
		const autoUpdateCleanUp = autoUpdate(buttonRef, floatingRef, () => {
			// @ts-ignore
			computePosition(buttonRef, floatingRef, {
				middleware: [
					autoPlacement({
						alignment: 'start',
						allowedPlacements: ['top-start', 'top-end'],
						padding: 4,
					}),
					shift(),
					offset(8),
				],
			}).then(({ x, y }) => {
				// @ts-ignore
				Object.assign(floatingRef.style, {
					left: `${x}px`,
					top: `${y}px`,
				});
			});
		});
		document.addEventListener('click', handleOutsideClick);
		return () => {
			autoUpdateCleanUp && autoUpdateCleanUp();
		};
	};

	$effect(() => {
		if (show) autoPlacementCleanup = handleFloatingUI();
		else {
			autoPlacementCleanup && autoPlacementCleanup();
			showFull = false;
		}
	});

	onMount(() => {});

	onDestroy(() => {
		autoPlacementCleanup && autoPlacementCleanup();
	});

	const onEmojiClick = (codepoints: number[]) => {
		const codepoints_rgi = rgi(codepoints);
		toggleMessageReaction(message, { emoji_codepoints_rgi: codepoints_rgi });
		show = false;
		playAudio('modules/' + identifier + '/audio/reaction.mp3');
	};
</script>

<style>
	.emojis-browser {
		overflow-y: auto;
		height: 400px;
		max-height: 400px;
	}

	.reaction-button {
		display: flex;
		align-items: center;
		font-size: 20px;
	}

	.reaction-tooltip {
		display: flex;
		align-items: center;
		background: var(--primary-softer-background);
		padding: 8px;
		border-radius: 20px;
		box-shadow: var(--shadow);
		max-width: 300px;
	}

	.emojis {
		display: flex;
	}

	.emoji-button {
		display: flex;
		align-items: center;
		padding: 0px 4px;
	}

	.expand {
		display: flex;
		justify-content: center;
		align-items: center;
		background: #da0;
		border-radius: 50%;
		margin-left: 6px;
		width: 30px;
		height: 30px;
	}

	.emoji {
		font-size: 24px;
	}

	.floating {
		position: absolute;
		width: max-content;
		top: 0;
		left: 0;
	}
</style>

{#snippet emoji(codepoints)}
	<Clickable onClick={() => onEmojiClick(codepoints)} data-testid="message-reaction-emoji-button">
		<div class="emoji-button emoji">
			<Emoji {codepoints} context={'menu'} is_single size={30} />
		</div>
	</Clickable>
{/snippet}

<div bind:this={buttonRef} class="reaction-button" class:open={show}>
	<Icon testId="message-reaction-menu-button" img="modules/{identifier}/img/reaction-add.svg" alt="Add reaction" colorVariable="--primary-foreground" size="24px" padding="0px" {onClick} />
</div>

{#if show}
	<Portal>
		<div bind:this={floatingRef} class="reaction-tooltip floating" style:display={show ? 'block' : 'none'}>
			<div class="emojis">
				{@render emoji([128077])}
				{@render emoji([128516])}
				{@render emoji([128513])}
				{@render emoji([128079])}
				{@render emoji([128512])}
				{@render emoji([128293])}
				{@render emoji([9829, 65039])}
				<Clickable onClick={() => (showFull = !showFull)}>
					<div class="expand">
						<Icon img={showFull ? 'img/cross.svg' : 'img/plus.svg'} alt={showFull ? 'Close' : 'Expand'} size="20px" colorVariable="--primary-foreground" />
					</div>
				</Clickable>
			</div>
			{#if showFull}
				<div class="emojis-browser">
					<Emojis {onEmojiClick} />
				</div>
			{/if}
		</div>
	</Portal>
{/if}
