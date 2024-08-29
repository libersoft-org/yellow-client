<script>
 function menuClick() {
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
 <div class="menu" on:click={menuClick}><img src="img/menu.svg" alt="☰" /></div>
 <div class="logo">Yellow</div>
</div>
