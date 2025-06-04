<script lang="ts">
	import { closePage } from '../dating.js';
	import TopBar from '@/core/components/TopBar/TopBar.svelte';
	import TopBarTitle from '@/core/components/TopBar/TopBarTitle.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Content from '../components/Content.svelte';
	import Map from '../components/Map.svelte';
</script>

<TopBar>
	<svelte:fragment slot="left">
		<Icon img="img/back.svg" onClick={closePage} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
		<TopBarTitle text="Map" />
	</svelte:fragment>
	<svelte:fragment slot="right">
		<Icon img="img/close.svg" onClick={closePage} colorVariable="--secondary-foreground" visibleOnMobile={false} />
	</svelte:fragment>
</TopBar>
<Content>
	<Map latitude="50.0755" longitude="14.4378" />
</Content>
