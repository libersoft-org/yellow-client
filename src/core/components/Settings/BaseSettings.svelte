<script lang="ts">
	import SettingsMenuItem from '@/core/components/Settings/SettingsMenuItem.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import Breadcrumb from '@/core/components/Breadcrumb/Breadcrumb.svelte';
	import { log } from '@/core/tauri.ts';
	import { setContext, tick } from 'svelte';
	interface Props {
		testId?: string;
		settingsObject?: any;
	}
	let elModal;
	/*
	interface SettingsNode {
		name: string;
		title: string;
		items?: SettingsNode[];
		menu?: Array<{ img?: string; title?: string; name?: string; onClick?: (e: Event) => void }>;
		body?: any;
		__parent?: SettingsNode | null;
	}
	interface MenuItems {
		Array<{
		 img?: string;
	  title?: string;
	  onClick?: (e: Event) => void;
	 }>
	}
	interface	optionalModalIcon {
	 img?: string;
  alt?: string;
		onClick?: (e: Event) => void;
	};
	*/
	let { testId = '', settingsObject }: Props = $props();
	let activeName = $state(settingsObject.name);
	let backIcon = $derived(activeName !== settingsObject.name ? { img: 'img/back.svg', alt: 'Back', onClick: goBack } : undefined);
	let currentNode = $state(settingsObject);

	$effect(() => {
		let n = findNode(settingsObject, activeName);
		console.log('[BaseSettings] activeName:', activeName, 'foundNode:', n);
		if (n) {
			currentNode = n;
		} else {
			currentNode = settingsObject;
		}
	});

	let breadcrumb = $derived(makeBreadcrumb(activeName));

	setContext('setSettingsSection', setSettingsSection);

	// Remove the problematic effect that resets navigation on modal reopen

	export function open() {
		elModal?.open();
	}

	export function close() {
		elModal?.close();
	}

	export async function setSettingsSection(name: string) {
		console.log('[BaseSettings] setSettingsSection:', name);
		activeName = name;
		await tick();
		await currentNode.instance?.onOpen?.();
	}

	function goBack() {
		console.log('[BaseSettings] goBack: ', activeName);
		const found = findNode(settingsObject, activeName);
		console.log('[BaseSettings] goBack found:', found);
		activeName = found?.__parent?.name ?? settingsObject.name;
	}

	function findNode(root: any, target: string): any {
		const stack = [root];
		while (stack.length) {
			const node = stack.pop();
			if (node.name === target) return node;
			(node.items ?? []).forEach((c: any) => stack.push(c));
		}
	}

	function makeBreadcrumb(targetName: string) {
		const stack: Array<{ node: any; path: any[] }> = [{ node: settingsObject, path: [] }];
		while (stack.length) {
			const item = stack.pop();
			if (!item) {
				log.error('Stack is empty while searching for breadcrumb path');
				return [];
			}
			const { node, path } = item;
			const nextPath = [...path, { title: node.title, onClick: async () => await setSettingsSection(node.name) }];
			if (node.name === targetName) return nextPath;
			(node.items ?? []).forEach((c: any) => stack.push({ node: c, path: nextPath }));
		}
		log.error('Node not found:', targetName);
		return [];
	}
</script>

<style>
	.settings {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>

<Modal {testId} title={settingsObject.title} bind:this={elModal} width="600px" optionalIcon={backIcon}>
	<div class="settings">
		{#if activeName !== settingsObject.name}
			<Breadcrumb items={breadcrumb} />
		{/if}
		{#if currentNode.menu}
			{#each currentNode.menu as item (item.name ?? item.title)}
				<SettingsMenuItem img={item.img} title={item.title} onClick={item.name ? async () => await setSettingsSection(item.name) : item.onClick} testId={item.name ? `settings-${item.name}` : undefined} />
			{/each}
		{/if}
		{#if currentNode.body}
			<currentNode.body {...currentNode.props} bind:this={currentNode.instance} close={goBack} />
		{/if}
	</div>
</Modal>
