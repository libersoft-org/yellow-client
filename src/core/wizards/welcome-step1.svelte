<style>
 .title {
  font-size: 25px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 5px;
 }

 .motto {
  font-size: 13px;
  text-align: center;
 }

 @keyframes bounce {
  0% {
    transform: scale(0.5);
  }
  70% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
 }

 .logo {
  display: flex;
  margin: 20px 0;
  justify-content: center;
  animation: bounce 1.5s ease;
  animation-fill-mode: forwards;
 }

 .logo img {
  width: 100px;
  height: 100px;
 }

 .description {
  text-align: center;
 }
</style>

<div class="title">Welcome to Yellow</div>
<div class="motto">The best decentralized communication app</div>
<div class="logo"><img src="img/logo.svg" alt="logo" /></div>
<div class="description">This wizard will help you to set up your own Yellow account.</div>
