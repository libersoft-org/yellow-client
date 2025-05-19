<script>
 import Core from '@/core/core.js';
 import Icon from '@/core/components/Icon/Icon.svelte';
 export let label = '';

 function back() {
  Core.hideSidebarMobile.set(false);
 }
</script>

<style>
 .panel {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 38px;
  min-height: 38px;
  padding: 10px;
  background-color: #222;
  color: #fff;
  box-shadow: var(--shadow);
 }

 .panel .label {
  font-size: 24px;
  font-weight: bold;
 }
</style>

<div class="panel">
 <Icon img="/img/back.svg" alt="Back" colorVariable="--icon-white" size="32px" padding="0px" visibleOnDesktop={false} onClick={back} />
 <div class="label">{label}</div>
</div>
