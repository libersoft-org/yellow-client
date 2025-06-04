<script lang="ts">
	import { closeModule } from '../dating.js';
	import TopBar from '@/core/components/TopBar/TopBar.svelte';
	import TopBarTitle from '@/core/components/TopBar/TopBarTitle.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
</script>

<TopBar>
	<svelte:fragment slot="left">
		<Icon img="img/back.svg" onClick={closeModule} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
		<TopBarTitle text="Dating" />
	</svelte:fragment>
	<svelte:fragment slot="right">
		<Icon img="img/close.svg" onClick={closeModule} colorVariable="--secondary-foreground" visibleOnMobile={false} />
	</svelte:fragment>
</TopBar>
<div>Welcome</div>
