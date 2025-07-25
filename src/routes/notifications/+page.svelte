<script>
	import Button from '@/core/components/Button/Button.svelte';
	import { writable, get } from 'svelte/store';
	import Notification from '@/core/components/Notification/Notification.svelte';
	import { multiwindow_store } from '@/core/scripts/multiwindow_store.ts';
	import { CUSTOM_NOTIFICATIONS, log } from '@/core/scripts/tauri.ts';
	import { onMount, onDestroy } from 'svelte';
	import { invoke } from '@tauri-apps/api/core';
	import { heightLogicalChanged, initPositioning } from './position.ts';
	export let maxNotifications = 3;
	let notifications = writable([]);
	let counter = 0;
	let heightLogical = writable(100);

	// // Catch all synchronous errors (see +layout.svelte)
	// window.addEventListener('error', event => {
	// 	// event.error is the Error object
	// 	console.error('+page Uncaught error:', event.error);
	// 	console.error('+page Stack trace:\n', event.error?.stack);
	// });
	//
	// // Catch unhandled promise rejections
	// window.addEventListener('unhandledrejection', event => {
	// 	const reason = event.reason;
	// 	console.error('+page Unhandled promise rejection:', reason);
	// 	console.error('+page Stack trace:\n', reason?.stack || reason);
	// });

	onMount(async () => {
		log.debug('notifications onMount: CUSTOM_NOTIFICATIONS:', CUSTOM_NOTIFICATIONS);
		let deinit;

		if (window.__TAURI__) {
			deinit = initPositioning();
			invoke('show', {});
		}
		if (CUSTOM_NOTIFICATIONS) {
			await initNotificationsPage();
		} else {
			log.debug('CUSTOM_NOTIFICATIONS is not defined');
		}

		return deinit;
	});

	heightLogical.subscribe(async v => {
		await heightLogicalChanged(v);
	});

	async function initNotificationsPage() {
		let s = await multiwindow_store('notifications', false);
		log.debug('initNotifications: store:', s);
		s.onChange((k, v) => {
			log.debug('store.onChange', k, !!v);
			if (!v) {
				onNotificationRemoved(k);
			} else {
				addNotificationData(v);
			}
		});
		s.onKeyChange((k, v) => {
			log.debug('store.onKeyChange', k, v);
		});
		//log.debug('initial store:', await s.entries());
		let values = await s.values();
		log.debug('initNotifications: values:', values);
		values = values.filter(v => !!v);
		values.sort((a, b) => a.ts - b.ts);
		for (let v of values) {
			if (v) await addNotificationData(v);
		}
	}

	function addNotificationData(data) {
		log.debug('addNotificationData data:', data);
		data.onClose = onClose.bind(data);
		data.onClick = onClick.bind(data);
		notifications.update(n => [...n, data]);
		//log.debug('notification added');
	}

	function clickAddNotification() {
		log.debug('Clicked on add notification');
		let notificationData = {
			id: 'n' + counter,
			img: 'https://img.freepik.com/free-vector/night-ocean-landscape-full-moon-stars-shine_107791-7397.jpg',
			title: 'Very ' + counter++,
			body: 'Lorem ipsum dolor sit amet, ',
		};
		notificationData.buttons = [
			{
				text: 'Abort',
				id: 'abort',
				onClick: onClick.bind(notificationData),
			},
			{
				text: 'Retry',
				id: 'retry',
				onClick: onClick.bind(notificationData),
			},
			{
				text: 'Fail',
				id: 'fail',
				onClick: onClick.bind(notificationData),
			},
		];
		notificationData.onClick = onClick.bind(notificationData);
		notificationData.onClose = onClose.bind(notificationData);
		notifications.update(n => [...n, notificationData]);
		log.debug('notification added');
	}

	async function onClose(e) {
		log.debug('onClose notification');
		this.onClick(e, 'close');
		onNotificationRemoved(this.id);
	}

	async function onClick(e, data) {
		e.stopPropagation();
		log.debug('onClick notification');
		await (await multiwindow_store('notification-events', false)).set(this.id, JSON.stringify(data));
		log.debug('notification event set');
	}

	async function onNotificationRemoved(id) {
		let s = await multiwindow_store('notifications', false);
		await s.delete(id);
		notifications.update(v => v.filter(item => item.id !== id));
		if (get(notifications).length === 0) {
			invoke('hide_notifications_window', {});
		}
	}

	async function clearNotifications() {
		log.debug('clearNotifications');
		for (let n of get(notifications)) {
			await n.onClose();
		}
	}
</script>

<!--<Button img="img/add.svg" text="Add notification" onClick={clickAddNotification} />-->

<style>
	.notifications-wrapper {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 0px;
		margin: 0px;
	}

	.notifications {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.notifications.reverse {
		flex-direction: column-reverse;
	}
</style>

<div class="notifications-wrapper" bind:clientHeight={$heightLogical}>
	{#if $notifications.length >= 2}
		<Button img="img/cross.svg" text="Close all {$notifications.length} notifications" onClick={clearNotifications} />
	{/if}

	<div class="notifications {'reverse'}">
		{#each $notifications.slice(-maxNotifications) as n (n.id)}
			<Notification data={n} />
		{/each}
	</div>
</div>
