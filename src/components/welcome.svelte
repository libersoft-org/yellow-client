<script>
 export let product;
 export let version;
 let notificationPermission = Notification.permission;

 function clickRequestNotificationPermission() {
  Notification.requestPermission().then(permission => {
   notificationPermission = permission;
  });
 }

 function keyRequestNotificationPermission() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   requestNotificationPermission();
  }
 }
</script>

<style>
 #welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 100vh;
 }

 img {
  width: 200px;
  max-width: 80%;
 }

 .product {
  font-size: 40px;
  font-weight: bold;
 }

 .version {
  display: flex;
  gap: 5px;
  font-size: 16px;
 }

 .warning {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #fec;
  border-radius: 10px;
  border: 1px solid #da8
 }
</style>

<div id="welcome">
 <img src="img/logo.svg" alt="{product}" />
 <div class="product">{product}</div>
 <div class="version">
  <div>Version:</div>
  <div class="bold">{version}</div>
 </div>
 {#if notificationPermission !== 'granted'}
  <div class="warning">
   <div class="bold">ATTENTION:</div>
   <div>Notifications are not enabled.</div>
   <div class="button" role="button" tabindex="0" on:click={clickRequestNotificationPermission} on:keydown={keyRequestNotificationPermission}>Enable notifications</div>
  </div>
 {/if}
</div>
