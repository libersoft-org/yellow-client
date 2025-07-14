<script lang="ts">
	import SettingsMenuItem from '@/core/components/Settings/SettingsMenuItem.svelte';
	import Window from '@/core/components/Window/Window.svelte';
	import Breadcrumb from '@/core/components/Breadcrumb/Breadcrumb.svelte';
	import { log } from '@/core/scripts/tauri.ts';
	import { setContext, tick } from 'svelte';
	interface IProps {
		testId?: string;
		settingsObject?: any;
	}
	let elWindow;

	/*
	interface ISettingsNode {
		name: string;
		title: string;
		items?: SettingsNode[];
		menu?: Array<{ img?: string; title?: string; name?: string; onClick?: (e: Event) => void }>;
		body?: any;
		__parent?: SettingsNode | null;
	}
	interface IMenuItems {
		Array<{
		 img?: string;
	  title?: string;
	  onClick?: (e: Event) => void;
	 }>
	}
	interface IOptionalWindowIcon {
	 img?: string;
  alt?: string;
		onClick?: (e: Event) => void;
	};
	*/
	let { testId = '', settingsObject }: IProps = $props();
	let activeName = $state(settingsObject.name);
	let backIcon = $derived(activeName !== settingsObject.name ? { img: 'img/back.svg', alt: 'Back', onClick: goBack } : undefined);

	let currentNode = $derived.by(() => {
		let n = findNode(settingsObject, activeName);
		console.log('[BaseSettings] activeName:', activeName, 'settingsObject:', settingsObject, 'found node:', n);
		return n || settingsObject;
	});

	let currentNodeInstance: any = $state();
	$effect(() => {
		currentNode.instance = currentNodeInstance;
	});

	let breadcrumb = $derived(makeBreadcrumb(activeName));

	setContext('setSettingsSection', setSettingsSection);

	// Remove the problematic effect that resets navigation on window reopen

	export function open(name?: string) {
		elWindow?.open();
		setSettingsSection(name || settingsObject.name);
	}

	export function close() {
		elWindow?.close();
	}

	export async function setSettingsSection(name: string, props: any = {}) {
		console.log('[BaseSettings] setSettingsSection:', name, 'props:', props);
		activeName = name;
		await tick();
		const node = findNode(settingsObject, name);
		if (node && Object.keys(props).length > 0) node.props = { ...node.props, ...props };
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
			/*console.log(
				'[BaseSettings] Searching ',
				root,
				' for node:',
				target,
				'Current stack:',
				stack.map(n => n.name)
			);*/
			const node = stack.pop();
			if (node.name === target) return node;
			//const children = node.items ?? [];
			//console.log('node.items:', node.items);
			//console.log('children:', children);
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

	.content {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>

<Window {testId} title={settingsObject.title} bind:this={elWindow} width="600px" optionalIcon={backIcon}>
	<div class="settings">
		{#if activeName !== settingsObject.name}
			<Breadcrumb items={breadcrumb} />
		{/if}

		<div class="content" data-testid={testId + '-content-' + activeName}>
			{#if currentNode.menu}
				{#each currentNode.menu as item (item.name ?? item.title)}
					<SettingsMenuItem img={item.img} title={item.title} onClick={item.name ? async () => await setSettingsSection(item.name) : item.onClick} testId={item.name ? `settings-${item.name}` : undefined} />
				{/each}
			{/if}

			{#if currentNode.body}
				<currentNode.body {...currentNode.props} bind:this={currentNodeInstance} close={goBack} />
			{/if}
		</div>
	</div>
</Window>
