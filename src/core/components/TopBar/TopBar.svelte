<script>
</script>

<style>
 .top-bar {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  max-height: calc(var(--menu-height) - 20px);
  height: calc(var(--menu-height) - 20px);
  padding: 10px;
  background-color: #222;
  color: #fff;
  box-shadow: var(--shadow);
 }
</style>

<div class="top-bar">
 <slot />
</div>
