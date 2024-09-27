<style>
 .title {
  font-size: 25px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 5px;
 }

 .description {
  font-size: 13px;
  margin-bottom: 20px;
 }

 @keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
   transform: translateY(0);
  }
  40% {
   transform: translateY(-30px);
  }
  60% {
   transform: translateY(-15px);
  }
 }

 .logo {
  display: flex;
  justify-content: center;
  animation: bounce 2s infinite;
 }

 .logo img {
  width: 100px;
  height: 100px;
 }
</style>

<div class="title">Welcome to Yellow</div>
<div class="description">The best decentralized communication app</div>
<div class="logo"><img src="img/logo.svg" alt="logo" /></div>
