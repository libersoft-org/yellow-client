<script>
 function menuClick() {
 }
</script>

<style>
 #bar {
  display: flex;
  align-items: center;
  height: 50px;
  background-color: #FD1;
  color: #222;
 }

 #bar .menu {
  padding: 10px;
  cursor: pointer;
 }

 #bar .menu img {
  width: 20px;
  height: 20px;
 }
</style>

<div id="bar">
 <div class="menu" on:click={menuClick}><img src="img/menu.svg" alt="☰" /></div>
 <div class="bold">Yellow</div>
</div>
