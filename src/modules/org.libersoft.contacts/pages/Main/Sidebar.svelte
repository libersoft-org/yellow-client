<script lang="ts">
	import { hideSidebarMobile } from '@/core/scripts/stores.ts';
	import SidebarButton from '@/core/components/Sidebar/SidebarButton.svelte';
	import { module } from '../../scripts/module.ts';

	function clickShowContent() {
		hideSidebarMobile.set(true);
	}
</script>

<SidebarButton img="modules/{module.identifier}/img/contacts.svg" text="Show contacts" visibleOnDesktop={false} onClick={clickShowContent} />
<div>Contact list - sidebar</div>
