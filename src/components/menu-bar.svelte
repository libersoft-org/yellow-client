<script>
 function menuClick() {
 }

 function menuKey(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   menuClick();
  }
 }
</script>

<style>
 #bar {
  display: flex;
  align-items: center;
  height: 72px;
  background-color: #FD1;
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

 .logo {
  font-size: 25px;
  font-weight: bold;
 }
</style>

<div id="bar">
 <div class="menu" role="button" tabindex="0" on:click={menuClick} on:keydown={menuKey}><img src="img/menu.svg" alt="☰" /></div>
 <div class="logo">Yellow</div>
</div>
