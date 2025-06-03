<script lang="ts">
	import { hideSidebarMobile } from '@/core/core.ts';
	import { page } from '../dating.js';
	import TopBar from '@/core/components/TopBar/TopBar.svelte';
	import TopBarTitle from '@/core/components/TopBar/TopBarTitle.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Content from '../components/Content.svelte';
	import Map from '../components/Map.svelte';

	function modulePageClose() {
		page.set('');
		hideSidebarMobile.set(false);
	}
</script>

<TopBar>
	<svelte:fragment slot="left">
		<Icon img="img/back.svg" onClick={modulePageClose} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
		<TopBarTitle text="Map" />
	</svelte:fragment>
</TopBar>
<Content>
	<Map latitude="50.0755" longitude="14.4378" />
</Content>
