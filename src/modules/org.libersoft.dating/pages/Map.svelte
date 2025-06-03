<script lang="ts">
	import core, { isMobile } from '@/core/core.js';
	import { page } from '../dating.js';
	import TopBar from '@/core/components/TopBar/TopBar.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Content from '../components/Content.svelte';
	import Map from '../components/Map.svelte';

	function modulePageClose() {
		page.set('');
		core.hideSidebarMobile.set(false);
	}
</script>

<TopBar>
	<svelte:fragment slot="left">
		{#if $isMobile}
			<Icon img="img/back.svg" onClick={() => modulePageClose()} colorVariable="--primary-foreground" visibleOnDesktop={true} />
		{/if}
		<h1 class="title">Map</h1>
	</svelte:fragment>
</TopBar>

<Content>
	<Map latitude="50.0755" longitude="14.4378" />
</Content>
