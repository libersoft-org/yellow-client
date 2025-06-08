<script lang="ts">
	import SettingsMenuItem from '@/core/components/Settings/SettingsMenuItem.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import Breadcrumb from '@/core/components/Breadcrumb/Breadcrumb.svelte';
	interface Props {
		settingsObject?: any;
	}
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
	let { settingsObject }: Props = $props();
	let activeName = $state(settingsObject.name);
	const backIcon = $derived(activeName !== settingsObject.name ? { img: 'img/back.svg', alt: 'Back', onClick: goBack } : null);
	const currentNode = $derived(findNode(settingsObject, activeName) ?? settingsObject);
	const breadcrumb = $derived(makeBreadcrumb(activeName));

	function setName(name: string) {
		activeName = name;
	}

	function goBack() {
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
			const { node, path } = stack.pop();
			const nextPath = [...path, { title: node.title, onClick: () => setName(node.name) }];
			if (node.name === targetName) return nextPath;
			(node.items ?? []).forEach((c: any) => stack.push({ node: c, path: nextPath }));
		}
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

<Modal title={settingsObject.title} show={true} width="400px" optionalIcon={backIcon}>
	<div class="settings">
		{#if activeName !== settingsObject.name}
			<Breadcrumb items={breadcrumb} />
		{/if}
		{#if currentNode.menu}
			{#each currentNode.menu as item (item.name ?? item.title)}
				<SettingsMenuItem img={item.img} title={item.title} onClick={item.name ? () => setName(item.name) : item.onClick} />
			{/each}
		{/if}
		{#if currentNode.body}
			<currentNode.body />
		{/if}
	</div>
</Modal>
