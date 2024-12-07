<script>
 import Core from '../../../core/core.js';
 import PanelButton from '../components/panel-button.svelte';
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
 <PanelButton img="/img/back-white.svg" alt="Back" hiddenOnDesktop={true} onClick={back} />
 <div class="label">{label}</div>
</div>
