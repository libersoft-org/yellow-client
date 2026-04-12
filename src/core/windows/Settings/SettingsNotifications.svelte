<script lang="ts">
	import type { Unsubscriber } from 'svelte/store';
	import { onMount } from 'svelte';
	import { log, CUSTOM_NOTIFICATIONS } from '@/core/scripts/tauri.ts';
	import { customNotificationsOn, animationDuration, animationName, titleMaxLines, bodyMaxLines, bgColor, bgColorHover, borderColor, titleColor, descColor } from '@/core/scripts/notifications_settings.ts';
	import { skipFirst } from '$lib/skipfirst_store.ts';
	import { updateExampleNotification } from '@/core/scripts/notifications.ts';
	import Input from '@/core/components/Input/Input.svelte';
	import Select from '@/core/components/Select/Select.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';
	import SettingsNotificationsBasic from '@/core/windows/Settings/SettingsNotificationsBasic.svelte';
	import SettingsNotificationsAlert from '@/core/windows/Settings/SettingsNotificationsAlert.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';

	onMount(() => {
		const stores = [animationName, animationDuration, titleMaxLines, bodyMaxLines, bgColor, bgColorHover, borderColor, titleColor, descColor];
		const unsubscribers: Unsubscriber[] = stores.map(store =>
			skipFirst(store as any).subscribe(value => {
				log.debug(`Store updated:`, value);
				updateExampleNotification();
			})
		);
		return () => {
			for (const unsub of unsubscribers) unsub();
		};
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
				<Tbody>
					<TbodyTr>
						<Td bold>Animation:</Td>
						<Td>
							<Select bind:value={$animationName}>
								<Option value="none" text="None" />
								<Option value="zoom" text="Zoom" />
								<Option value="opacity" text="Opacity" />
							</Select>
						</Td>
					</TbodyTr>
					<TbodyTr>
						<Td bold>Animation duration:</Td>
						<Td>
							<Input type="number" bind:value={$animationDuration} min={0} max={1000} step={10} />ms
						</Td>
					</TbodyTr>
					<TbodyTr>
						<Td bold>Maximum number of lines in title:</Td>
						<Td>
							<Input type="number" bind:value={$titleMaxLines} min={1} max={3} />
						</Td>
					</TbodyTr>
					<TbodyTr>
						<Td bold>Maximum number of lines in description:</Td>
						<Td>
							<Input type="number" bind:value={$bodyMaxLines} min={1} max={5} />
						</Td>
					</TbodyTr>
					<TbodyTr>
						<Td bold>Background color:</Td>
						<Td>
							<div>
								<Input type="color" bind:value={$bgColor} />
								{$bgColor}
							</div>
						</Td>
					</TbodyTr>
					<TbodyTr>
						<Td bold>Background color on mouse over:</Td>
						<Td>
							<div>
								<Input type="color" bind:value={$bgColorHover} />
								{$bgColorHover}
							</div>
						</Td>
					</TbodyTr>
					<TbodyTr>
						<Td bold>Border color:</Td>
						<Td>
							<div>
								<Input type="color" bind:value={$borderColor} />
								{$borderColor}
							</div>
						</Td>
					</TbodyTr>
					<TbodyTr>
						<Td bold>Title color:</Td>
						<Td>
							<div>
								<Input type="color" bind:value={$titleColor} />
								{$titleColor}
							</div>
						</Td>
					</TbodyTr>
					<TbodyTr>
						<Td bold>Description color:</Td>
						<Td>
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
