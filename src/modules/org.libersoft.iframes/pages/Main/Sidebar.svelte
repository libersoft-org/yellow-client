<script lang="ts">
	import { hideSidebarMobile } from '@/core/scripts/stores.ts';
	import SidebarButton from '@/core/components/Sidebar/SidebarButton.svelte';
	let url: string = 'https://koo5.github.io/';
</script>

<SidebarButton img="img/hide.svg" text="Hide sidebar" onClick={() => hideSidebarMobile.set(true)} />
<iframe sandbox="allow-scripts" src={url} title="sidebar" style="border:none; height: 100%; x-scroll: none; width: 100%; overflow: hidden;"> </iframe>
