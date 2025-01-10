<style>
 .welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: url('/img/background.webp') repeat;
  background-size: 400px;
 }

 .welcome .illustration {
  width: 400px;
  max-width: (100% - 20px);
  height: 400px;
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
 <img class="illustration" src="modules/org.libersoft.messages/img/superhero_pigeon.svg" alt="" />
 <div class="label">Select your conversation<br /> or start a new one</div>
</div>
