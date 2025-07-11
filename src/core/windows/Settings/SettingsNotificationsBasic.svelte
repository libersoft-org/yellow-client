<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { writable, get, type Unsubscriber } from 'svelte/store';
	import { availableMonitors, type Monitor } from '@tauri-apps/api/window';
	import { debug } from '@/core/scripts/stores.ts';
	import { log, BROWSER } from '@/core/scripts/tauri.ts';
	import { deleteExampleNotifications, setNotificationsEnabled } from '@/core/scripts/notifications.ts';
	import { selectedMonitorName, selectedNotificationsCorner, enableCustomNotifications, customNotificationsOn, notificationsSoundEnabled, notificationsSettingsAlert, notificationsEnabled, isRequestingNotificationsPermission } from '@/core/scripts/notifications_settings.ts';
	import { deleteNotification, updateExampleNotification, exampleNotifications } from '@/core/scripts/notifications.ts';
	import { skipFirst } from '$lib/skipfirst_store.ts';
	import Switch from '@/core/components/Switch/Switch.svelte';
	import Select from '@/core/components/Select/Select.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import CornerSelector from '@/core/components/CornerSelector/CornerSelector.svelte';
	// Local monitors store for this component
	let monitors = writable<Monitor[]>([]);
	let monitorInterval: ReturnType<typeof setInterval> | undefined;
	let permissionInterval: ReturnType<typeof setInterval> | undefined;
	let monitorOptions = writable<any[]>([]);
	let _notificationsEnabled = get(notificationsEnabled);
	// Store all subscription unsubscribe functions
	const unsubscribers: Unsubscriber[] = [];

	// Helper to add subscriptions and track unsubscribers
	function addSubscription<T>(
		store: {
			subscribe: (callback: (value: T) => void) => Unsubscriber;
		},
		callback: (value: T) => void
	): void {
		const unsubscribe = skipFirst(store).subscribe(callback);
		unsubscribers.push(unsubscribe);
	}

	$: updateNotificationsEnabled(_notificationsEnabled);

	async function updateNotificationsEnabled(value) {
		console.log('updateNotificationsEnabled value:', value);
		if (get(notificationsEnabled) === value) return;
		setNotificationsEnabled(value);
		let v = get(notificationsEnabled);
		if (v !== value) {
			await tick();
			_notificationsEnabled = v;
		}
	}

	function setupNotificationPermissionTimer() {
		permissionInterval = setInterval(() => {
			//log.debug('permissionInterval:', Notification.permission);
			if (get(isRequestingNotificationsPermission)) return;

			if (Notification.permission === 'granted') {
				notificationsSettingsAlert.set('');
			} else {
				if (get(notificationsEnabled)) {
					notificationsSettingsAlert.set('blocked');
				}
				notificationsEnabled.set(Boolean(get(notificationsEnabled)));
			}
		}, 1000);
	}

	onMount(() => {
		if (window.__TAURI__) {
			updateMonitors();
			monitorInterval = setInterval(updateMonitors, 1000);
		}

		if (BROWSER) {
			setupNotificationPermissionTimer();
		}

		addSubscription(monitors, value => {
			monitorOptions.set(
				[
					//{ name: 'primary', label: 'primary' },
					{ name: 'main_window_monitor', label: 'Main window monitor' },
				].concat(
					value.map((m: any) => ({
						name: m.name,
						label: m.name + '(' + m.size.width + 'x' + m.size.height + ')',
					}))
				)
			);
		});

		addSubscription(notificationsSoundEnabled, v => {
			log.debug('notificationsSoundEnabled:', v);
			updateExampleNotification();
		});

		addSubscription(selectedMonitorName, async v => {
			log.debug('selectedMonitor:', v);
			await deleteExampleNotifications();
			updateExampleNotification();
		});

		addSubscription(selectedNotificationsCorner, async v => {
			log.debug('selectedNotificationsCorner:', v);
			await deleteExampleNotifications();
			updateExampleNotification();
		});

		addSubscription(enableCustomNotifications, async v => {
			log.debug('enableCustomNotifications:', v);
			await deleteExampleNotifications();
			updateExampleNotification();
		});

		addSubscription(notificationsEnabled, value => {
			_notificationsEnabled = value;
			log.debug('notificationsEnabled:', value);
			updateExampleNotification();
		});
	});

	onDestroy(async () => {
		// Clean up all store subscriptions
		unsubscribers.forEach(unsubscribe => unsubscribe());

		// Clear intervals
		if (monitorInterval) {
			clearInterval(monitorInterval);
		}
		if (permissionInterval) {
			clearInterval(permissionInterval);
		}

		for (const notification of get(exampleNotifications)) {
			await deleteNotification(notification);
		}
	});

	async function updateMonitors() {
		let mons = await availableMonitors();
		//log.debug('updateMonitors:', mons);
		monitors.set(mons);
	}
</script>

<Table>
	<Tbody>
		<TbodyTr>
			<Td bold>Notifications:</Td>
			<Td>
				<Switch data-testid="notifications enabled toggle" label="Notifications" bind:checked={_notificationsEnabled} />
			</Td>
		</TbodyTr>
		<TbodyTr>
			<Td bold>Notification sound:</Td>
			<Td>
				<Switch label="Notification sound" bind:checked={$notificationsSoundEnabled} />
			</Td>
		</TbodyTr>
		{#if $customNotificationsOn}
			<TbodyTr>
				<Td bold>Custom notifications:</Td>
				<Td>
					<Switch label="Custom notifications" bind:checked={$enableCustomNotifications} />
				</Td>
			</TbodyTr>
			{#if $customNotificationsOn}
				<TbodyTr>
					<Td bold>Monitor:</Td>
					<Td>
						<Select bind:value={$selectedMonitorName}>
							{#each $monitorOptions as monitor}
								<Option value={monitor.name} selected={monitor.name === $selectedMonitorName} text={monitor.label} />
							{/each}
						</Select>
						{#if $debug}$selectedMonitorName:{$selectedMonitorName}{/if}
					</Td>
				</TbodyTr>
				<TbodyTr>
					<Td bold>Corner:</Td>
					<Td>
						<CornerSelector bind:value={$selectedNotificationsCorner} />
					</Td>
				</TbodyTr>
			{/if}
		{/if}
	</Tbody>
</Table>
