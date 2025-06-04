<script lang="ts">
	import { closePage } from '../dating.js';
	import TopBar from '@/core/components/TopBar/TopBar.svelte';
	import TopBarTitle from '@/core/components/TopBar/TopBarTitle.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Content from '../components/Content.svelte';
</script>

<TopBar>
	<svelte:fragment slot="left">
		<Icon img="img/back.svg" onClick={closePage} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
		<TopBarTitle text="Settings" />
	</svelte:fragment>
	<svelte:fragment slot="right">
		<Icon img="img/close.svg" onClick={closePage} colorVariable="--secondary-foreground" visibleOnMobile={false} />
	</svelte:fragment>
</TopBar>
<Content>Settings</Content>
