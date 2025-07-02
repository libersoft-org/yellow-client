<script lang="ts">
	import SettingsMenuItem from '@/core/components/Settings/SettingsMenuItem.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import Breadcrumb from '@/core/components/Breadcrumb/Breadcrumb.svelte';
	import { log } from '@/core/tauri.ts';
	import { setContext } from 'svelte';
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
		console.log('[BaseSettings] settingsObject:', settingsObject);
		console.log('[BaseSettings] activeName:', activeName);
		let n = findNode(settingsObject, activeName);
		console.log('[BaseSettings] findNode:', n);
		if (n) {
			console.log('[BaseSettings] Found node:', n);
			currentNode = n;
		} else {
			console.log('[BaseSettings] Node not found:', activeName);
			currentNode = settingsObject;
		}
	});

	let breadcrumb = $derived(makeBreadcrumb(activeName));

	setContext('setSettingsSection', setName);

	// Remove the problematic effect that resets navigation on modal reopen

	export function open() {
		activeName = settingsObject.name; // Reset to root when opening settings
		elModal?.open();
	}

	export function close() {
		elModal?.close();
	}

	export function setName(name: string) {
		console.log('[BaseSettings] setName:', name);
		activeName = name;
	}

	function goBack() {
		console.log('[BaseSettings] goBack');
		activeName = findNode(settingsObject, activeName)?.__parent?.name ?? settingsObject.name;
	}

	function attachParents(node: any, parent: any = null) {
		node.__parent = parent;
		(node.items ?? []).forEach((c: any) => attachParents(c, node));
	}

	if (!settingsObject.__parent) attachParents(settingsObject);

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
			const nextPath = [...path, { title: node.title, onClick: () => setName(node.name) }];
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
				<SettingsMenuItem img={item.img} title={item.title} onClick={item.name ? () => setName(item.name) : item.onClick} testId={item.name ? `settings-${item.name}` : undefined} />
			{/each}
		{/if}
		{#if currentNode.body}
			<currentNode.body {...currentNode.props} />
		{/if}
	</div>
</Modal>
