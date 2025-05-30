<script lang="ts">
	import Content from '../components/content.svelte';
	import core, { isMobile } from '@/core/core.js';
	import TopBar from '@/core/components/TopBar/TopBar.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import { page } from '../dating.js';

	function modulePageClose() {
		page.set('');
		core.hideSidebarMobile.set(false);
	}
</script>

<TopBar>
	<svelte:fragment slot="left">
		{#if $isMobile}
			<Icon img="img/back.svg" onClick={() => modulePageClose()} colorVariable="--color-default-background" visibleOnDesktop={true} />
		{/if}
		<h1 class="title">Settings</h1>
	</svelte:fragment>
</TopBar>
<Content>Settings</Content>
