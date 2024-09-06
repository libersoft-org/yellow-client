<script>
 export let product;
 export let version;
 export let link;
 
 function clickLogo() {
  window.open(link, '_blank');
 }

 function keyLogo() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickLogo();
  }
 }
</script>

<style>

/*.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 100vh;
  background: url('img/background.webp') repeat;
  background-size: 400px;
 }

 .welcome .logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
 }

 .welcome .logo img {
  width: 200px;
  max-width: 80%;
 }

 .welcome .logo .product {
  font-size: 40px;
  font-weight: bold;
 }

 .welcome .version {
  display: flex;
  gap: 5px;
  font-size: 16px;
 }

 .welcome .warning {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px;
  margin: 10px;
  background-color: #fec;
  border-radius: 10px;
  border: 1px solid #da8
 }*/
</style>

<div class="welcome-sidebar">
 <div class="logo" role="button" tabindex="0" on:click={clickLogo} on:keydown={keyLogo}>
  <img src="img/logo.svg" alt="{product}" />
  <div class="product">{product}</div>
 </div>
 <div class="version">
  <div>Version:</div>
  <div class="bold">{version}</div>
 </div>
</div>
