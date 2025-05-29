<script>
	import BaseButton from '@/core/components/Button/BaseButton.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import { log } from '../../tauri.ts';
	import { animationDuration, animationName, titleMaxLines, bodyMaxLines, bgColor, borderColor, bgColorHover, titleColor, descColor, notificationsSoundEnabled } from '../../notifications_settings.ts';
	import { onDestroy, onMount } from 'svelte';
	import { playNotificationSound, stopNotificationSound } from '@/core/notifications.ts';
	export let data;
	export let closing = false;

	function handleClosing(e) {
		e.stopPropagation();
		e.stopImmediatePropagation();
		closing = true;
		setTimeout(() => {
			data.onClose && data.onClose(e, 'close');
		}, animationDuration);
	}

	onMount(() => {
		playNotificationSound(data);
	});

	onDestroy(() => {
		stopNotificationSound(data);
	});
</script>

<style>
	.notification {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 10px;
		border-radius: 10px;
		max-width: 400px;
		background-color: var(--bgColor);
		transition: background-color 0.5s ease;
	}

	.notification:hover {
		background-color: var(--bgColorHover);
	}

	.notification.zoom-in {
		animation: zoom-in var(--anim-duration) ease-out;
	}

	.notification.zoom-out {
		animation: zoom-out var(--anim-duration) ease-in forwards;
	}

	.notification.opacity-in {
		animation: opacity-in var(--anim-duration) linear 1;
	}

	.notification.opacity-out {
		animation: opacity-out var(--anim-duration) linear 1;
	}

	@keyframes zoom-in {
		from {
			transform: scale(0);
		}
		to {
			transform: scale(1);
		}
	}

	@keyframes zoom-out {
		from {
			transform: scale(1);
		}
		to {
			transform: scale(0);
		}
	}

	@keyframes opacity-in {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	@keyframes opacity-out {
		0% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	.top {
		display: flex;
	}

	.top .left {
		flex: 1 0 auto;
		padding-top: 10px;
		padding-left: 10px;
	}

	.top .left .image {
		width: 50px;
		height: 50px;
		border-radius: 10px;
	}

	.top .left .image img {
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 10px;
	}

	.top .right {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		min-width: 0;
	}

	.top .right .line {
		display: flex;
	}

	.top .right .line .title {
		--font-size: 18px;
		--line-height: calc(var(--font-size) + 4px);
		margin: 10px;
		font-weight: bold;
		text-overflow: ellipsis;
		overflow: hidden;
		flex: 1 1 auto;
	}

	.top .right .line .close :global(.icon) {
		border-radius: 10px;
		background-color: rgb(255, 255, 255, 0.1);
		max-height: 30px;
		transition: background-color 0.5s ease;
	}

	.top .right .line .close :global(.icon:hover) {
		background-color: rgb(255, 255, 255, 0.25);
	}

	.top .right .body {
		--font-size: 14px;
		--line-height: calc(var(--font-size) + 5px);
		margin: 10px;
		font-size: 14px;
	}

	/* fallback pro starší WebKit */
	.clamp-3 {
		font-size: var(--font-size);
		line-clamp: var(--lines);
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: var(--lines);
		overflow: hidden;
		line-height: calc(var(--line-height));
		max-height: calc(var(--font-size) * (var(--line-height)));
	}

	/* .top .right .line .title,
 .top .right .body {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
 }*/

	.bottom .buttons {
		display: flex;
		gap: 10px;
	}
</style>

<BaseButton
	onClick={e => {
		log.debug('***onClick');
		data.onClick(e, 'click');
	}}
>
	<div class="notification {$animationName && $animationName + '-' + (closing ? 'out' : 'in')}" style="--anim-duration: {$animationDuration}ms; --bgColor:{$bgColor}; --bgColorHover:{$bgColorHover}; border: 1px solid {$borderColor};">
		{#if data.icon || data.title || data.body}
			<div class="top">
				{#if data.icon}
					<div class="left">
						<div class="image" style="border: 1px solid {$borderColor};">
							<img src={data.icon} alt="Notification icon" />
						</div>
					</div>
				{/if}
				<div class="right">
					<div class="line">
						{#if data.title}
							<div class="title clamp-3" style:color={$titleColor} style:--lines={$titleMaxLines ? $titleMaxLines : 1}>
								{data.title}
							</div>
						{/if}
						<div class="close">
							<Icon img="img/close.svg" alt="Close" colorVariable="--icon-white" size="10px" padding="10px" isButton onClick={e => handleClosing(e)} />
						</div>
					</div>
					{#if data.body}
						<div class="body clamp-3" style:--lines={$bodyMaxLines ? $bodyMaxLines : 3} style:color={$descColor}>
							{data.body}
						</div>
					{/if}
				</div>
			</div>
		{/if}
		{#if data.buttons}
			<div class="bottom">
				<div class="buttons">
					{#each data.buttons as b}
						<BaseButton text={b.text} onClick={e => b.onClick(b, b.id)} expand={b.expand} />
					{/each}
				</div>
			</div>
		{/if}
	</div>
</BaseButton>
