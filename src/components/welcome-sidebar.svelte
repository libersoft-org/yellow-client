<script>
 export let product;
</script>

<style>
 .welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: rgba(255, 221, 17, 0.2);
 }

 .welcome img {
  width: 30px;
  height: 30px;
 }
</style>

<div class="welcome">
 <img src="img/logo.svg" alt="{product}" />
</div>
