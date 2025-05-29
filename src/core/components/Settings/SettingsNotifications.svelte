<script lang="ts">
	import type { Unsubscriber } from 'svelte/store';
	import { log, CUSTOM_NOTIFICATIONS, BROWSER } from '../../tauri.ts';
	import { customNotificationsOn, animationDuration, animationName, titleMaxLines, bodyMaxLines, bgColor, bgColorHover, borderColor, titleColor, descColor, notificationsSoundEnabled } from '../../notifications_settings.ts';
	import { skipFirst } from '$lib/skipfirst_store.ts';
	import { updateExampleNotification } from '@/core/notifications.ts';
	import Input from '@/core/components/Input/Input.svelte';
	import Select from '@/core/components/Select/Select.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';
	import SettingsNotificationsBasic from '@/core/components/Settings/SettingsNotificationsBasic.svelte';
	import SettingsNotificationsAlert from '@/core/components/Settings/SettingsNotificationsAlert.svelte';

	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import TheadTh from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import TbodyTd from '@/core/components/Table/TableTbodyTd.svelte';

	// Store all subscription unsubscribe functions
	const unsubscribers: Unsubscriber[] = [];

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
						<TheadTh>Animation:</TheadTh>
						<TheadTh>Animation duration:</TheadTh>
						<TheadTh>Maximum number of lines in title:</TheadTh>
						<TheadTh>Maximum number of lines in description:</TheadTh>
						<TheadTh>Background color:</TheadTh>
						<TheadTh>Background color on mouse over:</TheadTh>
						<TheadTh>Border color:</TheadTh>
						<TheadTh>Title color:</TheadTh>
						<TheadTh>Description color:</TheadTh>
					</TheadTr>
				</Thead>
				<Tbody>
					<TbodyTr>
						<TbodyTd title="Animation">
							<Select bind:value={$animationName}>
								<Option value="none" text="None" />
								<Option value="zoom" text="Zoom" />
								<Option value="opacity" text="Opacity" />
							</Select>
						</TbodyTd>
						<TbodyTd title="Animation duration">
							<div>
								<Input type="number" bind:value={$animationDuration} min={0} max={1000} step={10} />ms
							</div>
						</TbodyTd>
						<TbodyTd title="Maximum number of lines in title">
							<Input type="number" bind:value={$titleMaxLines} min={1} max={3} />
						</TbodyTd>
						<TbodyTd title="Maximum number of lines in description">
							<Input type="number" bind:value={$bodyMaxLines} min={1} max={5} />
						</TbodyTd>
						<TbodyTd title="Background color">
							<div>
								<input type="color" bind:value={$bgColor} />
								{$bgColor}
							</div>
						</TbodyTd>
						<TbodyTd title="Background color on mouse over">
							<div>
								<input type="color" bind:value={$bgColorHover} />
								{$bgColorHover}
							</div>
						</TbodyTd>
						<TbodyTd title="Border color">
							<div>
								<input type="color" bind:value={$borderColor} />
								{$borderColor}
							</div>
						</TbodyTd>
						<TbodyTd title="Title color">
							<div>
								<input type="color" bind:value={$titleColor} />
								{$titleColor}
							</div>
						</TbodyTd>
						<TbodyTd title="Description color">
							<div>
								<input type="color" bind:value={$descColor} />
								{$descColor}
							</div>
						</TbodyTd>
					</TbodyTr>
				</Tbody>
			</Table>
		{/if}
	{/if}
</div>
