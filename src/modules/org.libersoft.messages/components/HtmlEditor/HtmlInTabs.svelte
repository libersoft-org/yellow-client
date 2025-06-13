<script>
	import HtmlEditor from './HtmlEditor.svelte';
	import HtmlEditorPreview from './HtmlEditorPreview.svelte';
	import Tabs from '@/core/components/Tabs/Tabs.svelte';
	import TabsItem from '@/core/components/Tabs/TabsItem.svelte';
	export let text;
	let activeTab = 'editor';

	function setTab(e, name) {
		activeTab = name;
	}
</script>

<Tabs data-testid="html-editor-tabs">
	<TabsItem label="HTML editor" active={activeTab === 'editor'} onClick={e => setTab(e, 'editor')} data-testid="html-editor-tab-editor" />
	<TabsItem label="Preview" active={activeTab === 'preview'} onClick={e => setTab(e, 'preview')} data-testid="html-editor-tab-preview" />
</Tabs>
{#if activeTab === 'editor'}
	<HtmlEditor bind:text />
{:else}
	<HtmlEditorPreview {text} />
{/if}
