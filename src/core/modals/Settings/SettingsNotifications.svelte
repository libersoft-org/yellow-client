<script lang="ts">
	import type { Unsubscriber } from 'svelte/store';
	import { log, CUSTOM_NOTIFICATIONS } from '@/core/scripts/tauri.ts';
	import { customNotificationsOn, animationDuration, animationName, titleMaxLines, bodyMaxLines, bgColor, bgColorHover, borderColor, titleColor, descColor } from '@/core/scripts/notifications_settings.ts';
	import { skipFirst } from '$lib/skipfirst_store.ts';
	import { updateExampleNotification } from '@/core/scripts/notifications.ts';
	import Input from '@/core/components/Input/Input.svelte';
	import Select from '@/core/components/Select/Select.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';
	import SettingsNotificationsBasic from '@/core/modals/Settings/SettingsNotificationsBasic.svelte';
	import SettingsNotificationsAlert from '@/core/modals/Settings/SettingsNotificationsAlert.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	const unsubscribers: Unsubscriber[] = []; // Store all subscription unsubscribe functions

	// Helper to add subscriptions and track unsubscribers
	function addSubscription<T>(store: { subscribe: (callback: (value: T) => void) => Unsubscriber }, callback: (value: T) => void): void {
		unsubscribers.push(store.subscribe(callback));
	}

	$effect(() => {
		for (let store of [animationName, animationDuration, titleMaxLines, bodyMaxLines, bgColor, bgColorHover, borderColor, titleColor, descColor]) {
			addSubscription(skipFirst(store as any), value => {
				log.debug(`Store ${store} updated:`, value);
				updateExampleNotification();
			});
		}
	});
</script>

<style>
	.settings-notifications {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>

<div class="settings-notifications">
	<SettingsNotificationsAlert />
	<SettingsNotificationsBasic />
	{#if CUSTOM_NOTIFICATIONS}
		{#if $customNotificationsOn}
			<Table>
				<Thead>
					<TheadTr>
						<Th>Animation:</Th>
						<Th>Animation duration:</Th>
						<Th>Maximum number of lines in title:</Th>
						<Th>Maximum number of lines in description:</Th>
						<Th>Background color:</Th>
						<Th>Background color on mouse over:</Th>
						<Th>Border color:</Th>
						<Th>Title color:</Th>
						<Th>Description color:</Th>
					</TheadTr>
				</Thead>
				<Tbody>
					<TbodyTr>
						<Td title="Animation">
							<Select bind:value={$animationName}>
								<Option value="none" text="None" />
								<Option value="zoom" text="Zoom" />
								<Option value="opacity" text="Opacity" />
							</Select>
						</Td>
						<Td title="Animation duration">
							<Input type="number" bind:value={$animationDuration} min={0} max={1000} step={10} />ms
						</Td>
						<Td title="Maximum number of lines in title">
							<Input type="number" bind:value={$titleMaxLines} min={1} max={3} />
						</Td>
						<Td title="Maximum number of lines in description">
							<Input type="number" bind:value={$bodyMaxLines} min={1} max={5} />
						</Td>
						<Td title="Background color">
							<div>
								<Input type="color" bind:value={$bgColor} />
								{$bgColor}
							</div>
						</Td>
						<Td title="Background color on mouse over">
							<div>
								<Input type="color" bind:value={$bgColorHover} />
								{$bgColorHover}
							</div>
						</Td>
						<Td title="Border color">
							<div>
								<Input type="color" bind:value={$borderColor} />
								{$borderColor}
							</div>
						</Td>
						<Td title="Title color">
							<div>
								<Input type="color" bind:value={$titleColor} />
								{$titleColor}
							</div>
						</Td>
						<Td title="Description color">
							<div>
								<Input type="color" bind:value={$descColor} />
								{$descColor}
							</div>
						</Td>
					</TbodyTr>
				</Tbody>
			</Table>
		{/if}
	{/if}
</div>
