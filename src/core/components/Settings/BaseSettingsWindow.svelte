<script lang="ts">
	import Window from '@/core/components/Window/Window.svelte';
	import type { ISettingsNode } from '@/core/types/settings.ts';
	import BaseSettingsSubtree from '@/core/components/Settings/BaseSettingsSubtree.svelte';
	import { tick } from 'svelte';

	interface IProps {
		testId?: string;
		settingsObject: ISettingsNode;
	}

	let elWindow;
	let elBaseSettingsSubtree;
	let activeName = $state('');
	let { testId = '', settingsObject }: IProps = $props();
	let backIcon = $derived(activeName !== settingsObject.name ? { img: 'img/back.svg', alt: 'Back', onClick: elBaseSettingsSubtree?.goBack } : undefined);

	export async function open(name?: string) {
		console.log('[BaseSettingsWindow] open:', name, 'activeName:', activeName, 'settingsObject:', settingsObject);
		elWindow?.open();
		console.log('[BaseSettingsWindow] open after elWindow.open():', elBaseSettingsSubtree);
		await tick();
		await tick();
		console.log('[BaseSettingsWindow] open after tick():', elBaseSettingsSubtree);
		await setSettingsSection(name || settingsObject.name);
		console.log('[BaseSettingsWindow] open after setSettingsSection():', elBaseSettingsSubtree);
	}

	export function close() {
		elWindow?.close();
	}

	export async function setSettingsSection(name: string, props?: Record<string, any>): Promise<void> {
		return elBaseSettingsSubtree.setSettingsSection(name, props);
	}
</script>

<style>
</style>

<Window {testId} title={settingsObject.title} bind:this={elWindow} width="600px" optionalIcon={backIcon}>
	<BaseSettingsSubtree bind:this={elBaseSettingsSubtree} {settingsObject} bind:activeName />
</Window>
