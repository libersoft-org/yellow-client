<script>
 let notificationPermission = Notification.permission;

 function requestNotificationPermission() {
  Notification.requestPermission().then(permission => {
   notificationPermission = permission;
  });
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

 .text {
  font-size: 40px;
  font-weight: bold;
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
 <img src="img/logo.svg" alt="Yellow" />
 <div class="text">Yellow</div>
 {#if notificationPermission !== 'granted'}
  <div class="warning">
   <div class="bold">ATTENTION:</div>
   <div>Notifications are not enabled.</div>
   <div class="button" on:click={requestNotificationPermission}>Enable notifications</div>
  </div>
 {/if}
</div>
