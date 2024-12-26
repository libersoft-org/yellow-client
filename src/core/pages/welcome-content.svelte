<script>
 import BaseButton from '../components/base-button.svelte';
 import Button from '../components/button.svelte';
 import { product, version, link } from '../core.js';
 let notificationPermission = Notification.permission;

 function clickLogo() {
  window.open(link, '_blank');
 }

 function clickRequestNotificationPermission() {
  Notification.requestPermission().then(permission => {
   notificationPermission = permission;
  });
 }
</script>

<style>
 .welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 100vh;
  background: url('/img/background.webp') repeat;
  background-size: 400px;
 }

 .welcome .logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
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
  border: 1px solid #da8;
 }
</style>

<div class="welcome">
 <BaseButton onClick={clickLogo}>
  <div class="logo">
   <img src="img/logo.svg" alt={product} />
   <div class="product">{product}</div>
  </div>
 </BaseButton>
 <div class="version">
  <div>Version:</div>
  <div class="bold">{version}</div>
 </div>
 {#if notificationPermission !== 'granted'}
  <div class="warning">
   <div class="bold">ATTENTION:</div>
   <div>Notifications are not enabled.</div>
   <Button text="Enable notifications" onClick={clickRequestNotificationPermission} />
  </div>
 {/if}
</div>
