<script>
 export let isMenuOpen = false;
 export let product;
 export let version;
 export let onClose;

 $: console.log('Menu isMenuOpen status:', isMenuOpen);

 function logoutClick() {
  alert('Logout');
  onClose();
 }

 function logoutKey(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   logoutClick();
  }
 }
</script>

<style>
 .menu {
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  top: var(--menu-height);
  left: 0;
  width: 250px;
  height: calc(100% - 72px);
  background-color: #222;
  color: #fff;
  z-index: 100;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  box-shadow: var(--shadow);
 }

 .menu.open {
  transform: translateX(0);
 }

 .menu-item {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  border-bottom: 1px solid #444;
 }

 .menu-item:hover {
  background-color: #333;
 }

 .menu-item img {
  width: 24px;
  height: 24px;
 }

 .footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  text-align: center;
  color: #ccc;
  border-top: 1px solid #444;
 }

 .footer .product {
  font-size: 18px;
  font-weight: bold;
 }

 .footer .version {
  display: flex;
  justify-content: center;
  gap: 5px;
  font-size: 14px;
 }
</style>

<div class="menu {isMenuOpen ? 'open' : ''}">
 <div>
  <div class="menu-item" role="button" tabindex="0" on:click={logoutClick} on:keydown={logoutKey}>
   <img src="img/logout.svg" alt="Logout" />
   <div>Logout</div>
  </div>
 </div>
 <div class="footer">
  <div class="product">{product}</div>
  <div class="version">
   <div>Version:</div>
   <div class="bold">{version}</div>
  </div>
 </div>
</div>
