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

<style>
	.container {
		border: 1px solid #000;
		border-radius: 10px;
		overflow: auto;
	}
</style>

<div>
	<Tabs>
		<TabsItem label="HTML editor" active={activeTab === 'editor'} onClick={e => setTab(e, 'editor')} />
		<TabsItem label="Preview" active={activeTab === 'preview'} onClick={e => setTab(e, 'preview')} />
	</Tabs>
</div>
<div class="container">
	{#if activeTab === 'editor'}
		<HtmlEditor bind:text />
	{:else}
		<HtmlEditorPreview {text} />
	{/if}
</div>
