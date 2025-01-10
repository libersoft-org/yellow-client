<script>
 const illustrations = ['pigeon', 'woman'];
</script>

<style>
 .welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 100vh;
  background: url('/img/background.webp') repeat;
  background-size: 400px;
 }

 .welcome .illustration {
  width: 350px;
  max-width: (100% - 20px);
  height: 350px;
  max-height: (100% - 20px);
 }

 .welcome .label {
  padding: 5px;
  border: 1px solid #fd1;
  border-radius: 20px;
  text-align: center;
  font-size: 20px;
  background-color: rgba(255, 221, 17, 0.3);
 }
</style>

<div class="welcome">
 <img class="illustration" src="modules/org.libersoft.messages/img/illustration_{illustrations[Math.floor(Math.random() * illustrations.length)]}.svg" alt="Illustration" />
 <div class="label">
  <div>Select your conversation</div>
  <div>or start a new one</div>
 </div>
</div>
