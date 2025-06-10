<script lang="ts">
	import { convertFromShortHex } from '@/core/utils/colors.js';
	import { type Writable, get } from 'svelte/store';
	import { user_themes, default_themes, themes, selected_theme_index, type Theme } from '@/core/themes.ts';
	import Input from '@/core/components/Input/Input.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	//import Thead from '@/core/components/Table/TableThead.svelte';
	//import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	//import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';

	/* This store is used in theme editor to provide read/write access to user themes and builtin themes. We will later disable writing to builtin themes in the UI. It is reactive to changes in selected theme index. It provides reading and writing to either user themes or builtin themes depending on the selected theme index. */
	class WritableCurrentThemeStore implements Writable<Theme> {
		private unsubscribe_selected_theme_index: () => void;
		private unsubscribe_themes: () => void;
		private current_selected_theme_index: number = 0;
		private current_themes: Theme[] = [];
		private subscribers: Array<(value: Theme) => void> = [];

		constructor() {
			this.unsubscribe_selected_theme_index = selected_theme_index.subscribe(index => {
				this.current_selected_theme_index = index;
				this.notifySubscribers();
			});

			this.unsubscribe_themes = themes.subscribe(all_themes => {
				this.current_themes = all_themes;
				this.notifySubscribers();
			});
		}

		private notifySubscribers() {
			if (this.current_themes && this.current_selected_theme_index !== undefined) {
				const theme = this.current_themes[this.current_selected_theme_index];
				if (theme) {
					for (const subscriber of this.subscribers) {
						subscriber(theme);
					}
				}
			}
		}

		subscribe(run: (value: Theme) => void) {
			this.subscribers.push(run);

			// Immediately call the subscriber with the current value if available
			if (this.current_themes && this.current_selected_theme_index !== undefined) {
				const theme = this.current_themes[this.current_selected_theme_index];
				if (theme) {
					run(theme);
				}
			}

			// Return unsubscribe function
			return () => {
				const index = this.subscribers.indexOf(run);
				if (index !== -1) {
					this.subscribers.splice(index, 1);
				}
			};
		}

		set(value: Theme) {
			if (this.current_selected_theme_index !== undefined) {
				// If it's a default theme (index < default_themes.length), we don't modify it
				if (this.current_selected_theme_index < default_themes.length) {
					console.warn('Cannot modify default theme');
					return;
				}

				// For user themes, update the theme in the user_themes store
				const user_theme_index = this.current_selected_theme_index - default_themes.length;
				const current_user_themes = get(user_themes);
				let updated_user_themes: Theme[] = [...current_user_themes];
				updated_user_themes[user_theme_index] = value;
				user_themes.set(updated_user_themes);
			}
		}

		update(updater: (value: Theme) => Theme) {
			if (this.current_themes && this.current_selected_theme_index !== undefined) {
				const current_theme = this.current_themes[this.current_selected_theme_index];
				if (current_theme) {
					this.set(updater(current_theme));
				}
			}
		}
	}

	const theme = new WritableCurrentThemeStore();

	// Determine if the current theme is a built-in theme
	let is_builtin_theme: boolean;
	$: is_builtin_theme = $selected_theme_index < default_themes.length;

	let theme_properties;
	$: theme_properties = Object.keys($theme.properties);
</script>

<Table>
	<Tbody>
		<TbodyTr>
			<Td title="Name">
				<Input type="text" bind:value={$theme.name} enabled={!is_builtin_theme} data-testid="theme-name-input" />
			</Td>
		</TbodyTr>
		{#each theme_properties as theme_property_name, index}
			<TbodyTr>
				<Td title={theme_property_name}>
					{#if theme_property_name === '--background-image'}
						<Input type="text" bind:value={$theme.properties[theme_property_name]} enabled={!is_builtin_theme} data-testid={`theme-text-${theme_property_name}`} />
					{:else}
						<Input type="color" bind:value={$theme.properties[theme_property_name]} displayValue={convertFromShortHex($theme.properties[theme_property_name])} enabled={!is_builtin_theme} data-testid={`theme-color-${theme_property_name}`} />
						{$theme.properties[theme_property_name]}
					{/if}
				</Td>
			</TbodyTr>
		{/each}
	</Tbody>
</Table>
