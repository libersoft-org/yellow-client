<script>
 export let toggleMenu;

 function menuClick() {
  toggleMenu();
 }

 function menuKey(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   menuClick();
  }
 }
</script>

<style>
 .bar {
  display: flex;
  align-items: center;
  height: var(--menu-height);
  background-color: #fd1;
  color: #222;
 }

 .menu {
  padding: 10px;
  cursor: pointer;
 }

 .menu img {
  width: 30px;
  height: 30px;
 }
</style>

<div class="bar">
 <div class="menu" role="button" tabindex="0" on:click={menuClick} on:keydown={menuKey}><img src="img/menu.svg" alt="☰" /></div>
</div>
