<script lang="ts">
	import { debug } from '@/core/scripts/stores.ts';
	import SettingsMenuItem from '@/core/components/Settings/SettingsMenuItem.svelte';
	import Breadcrumb from '@/core/components/Breadcrumb/Breadcrumb.svelte';
	import { log } from '@/core/scripts/tauri.ts';
	import { setContext, tick } from 'svelte';
	import type { ISettingsObject, ISettingsNode, SetSettingsSectionFn, ISettingsComponent } from '@/core/types/settings.ts';

	interface IProps {
		testId?: string;
		settingsObject: ISettingsObject;
		activeName: string;
	}

	let { testId = '', settingsObject, activeName = $bindable(settingsObject.name) }: IProps = $props();

	let id = Math.random().toString(36).substring(2, 15);

	let currentNode = $derived.by((): ISettingsNode => {
		let n = findNode(settingsObject, activeName);
		//console.debug('[BaseSettingsWindow] activeName:', activeName, 'settingsObject:', settingsObject, 'found node:', n);
		return n || settingsObject;
	});

	let currentNodeInstance: ISettingsComponent | undefined = $state();
	$effect(() => {
		//$inspect('[BaseSettingsWindow] currentNodeInstance updated:', currentNodeInstance);
		//$inspect('[BaseSettingsWindow] currentNode:', currentNode);
		currentNode.instance = currentNodeInstance;
	});

	let breadcrumb = $derived(makeBreadcrumb(activeName));

	setContext<SetSettingsSectionFn>('setSettingsSection', setSettingsSection);

	export async function setSettingsSection(name: string, props: Record<string, any> = {}) {
		//console.log('[BaseSettingsWindow] setSettingsSection:', name, 'props:', props);
		activeName = name;
		await tick();
		await tick();
		const node = findNode(settingsObject, name);
		if (node && Object.keys(props).length > 0) node.props = { ...node.props, ...props };
		await tick();
		if (!currentNode?.instance && currentNode?.body) {
			log.error('[BaseSettingsWindow] No instance found for node:', node, 'expected instance of body:', currentNode.body);
			return;
		}
		await currentNode.instance?.onOpen?.();
	}

	export async function goBack() {
		//console.log('[BaseSettingsWindow] goBack: ', activeName);
		const found = findNode(settingsObject, activeName);
		console.log('[BaseSettingsWindow] goBack found:', found);
		if (!found || !found.__parent) {
			log.error('[BaseSettingsWindow] No parent found for node:', found);
			return;
		}
		const p = found.__parent.deref();
		if (!p) {
			log.error('[BaseSettingsWindow] Parent is null for node:', found);
			return;
		}
		if (!p.name) {
			log.error('[BaseSettingsWindow] Parent has no name:', p);
			return;
		}
		const parentName = p.name ?? settingsObject.name;
		await setSettingsSection(parentName);
	}

	function findNode(root: ISettingsNode, target: string): ISettingsNode | undefined {
		const stack = [root];
		while (stack.length) {
			/*console.log(
				'[BaseSettingsWindow] Searching ',
				root,
				' for node:',
				target,
				'Current stack:',
				stack.map(n => n.name)
			);*/
			const node = stack.pop();
			if (!node) break;
			if (node.name === target) return node;
			//const children = node.items ?? [];
			//console.log('node.items:', node.items);
			//console.log('children:', children);
			(node.items ?? []).forEach(c => stack.push(c));
		}
		return undefined;
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
			(node.items ?? []).forEach(c => stack.push({ node: c, path: nextPath }));
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

	.debug {
		background-color: var(--primary-softer-background);
		border: 1px solid var(--primary-foreground);
		border-radius: 10px;
		padding: 0;
		margin: 0;
		max-height: 300px;
		overflow-y: auto;
	}
</style>

<div class="settings">
	{#if activeName !== settingsObject.name}
		<Breadcrumb items={breadcrumb} />
	{/if}

	<div class="content" data-testid={testId + '-content-' + activeName}>
		{#if currentNode.menu}
			{#each currentNode.menu as item (item.name ?? item.title)}
				<SettingsMenuItem img={item.img} title={item.title} onClick={item.name ? async () => await setSettingsSection(item.name!) : item.onClick} testId={item.name ? `settings-${item.name}` : undefined} />
			{/each}
		{/if}

		{#if currentNode.body}
			<currentNode.body {...currentNode.props} bind:this={currentNodeInstance} close={goBack} />
		{/if}
	</div>
</div>

{#if $debug}
	<div class="debug">
		BaseSettings Debug: currentNode:
		<pre>{JSON.stringify(currentNode, null, 2)}</pre>
	</div>
{/if}
