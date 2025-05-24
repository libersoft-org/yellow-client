<script>
 import Core from '@/core/core.js';
 import TopBar from '@/core/components/TopBar/TopBar.svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';
 export let label = '';

 function back() {
  Core.hideSidebarMobile.set(false);
 }
</script>

<style>
 .label {
  font-size: 24px;
  font-weight: bold;
 }
</style>

<TopBar>
 <Icon img="/img/back.svg" alt="Back" colorVariable="--icon-white" size="32px" padding="0px" visibleOnDesktop={false} onClick={back} />
 <div class="label">{label}</div>
</TopBar>
