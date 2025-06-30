<script lang="ts">
	import HtmlEditor from './HtmlEditor.svelte';
	import HtmlEditorPreview from './HtmlEditorPreview.svelte';
	import Tabs from '@/core/components/Tabs/Tabs.svelte';
	import TabsItem from '@/core/components/Tabs/TabsItem.svelte';
	interface Props {
		text?: string;
	}
	let { text = $bindable() }: Props = $props();
	let activeTab = $state('editor');

	function setTab(e, name) {
		activeTab = name;
	}
</script>

<Tabs>
	<TabsItem label="HTML editor" active={activeTab === 'editor'} onClick={e => setTab(e, 'editor')} />
	<TabsItem label="Preview" active={activeTab === 'preview'} onClick={e => setTab(e, 'preview')} />
</Tabs>
{#if activeTab === 'editor'}
	<HtmlEditor bind:text />
{:else}
	<HtmlEditorPreview {text} />
{/if}
