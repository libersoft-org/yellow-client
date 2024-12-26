<script>
 import { product, motto } from '../core.js';
</script>

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
 }

 .logo img {
  width: 100px;
  height: 100px;
  animation: bounce 1.5s ease;
  animation-fill-mode: forwards;
 }

 .description {
  text-align: center;
 }
</style>

<div class="title">Welcome to {product}</div>
<div class="motto">{motto}</div>
<div class="logo"><img src="img/logo.svg" alt="logo" /></div>
<div class="description">This wizard will help you to set up everything you need to get started.</div>
