<script>
 import CardButton from './photo-card-button.svelte';
 export let photo;
 //export let onYes;
 //export let onNo;
 let moving = false;
 let startX = 0;
 let currentX = 0;
 let threshold = 100;

 function startSwipe(e) {
  moving = true;
  startX = e.touches[0].clientX;
 }

 function moveSwipe(e) {
  currentX = e.touches[0].clientX - startX;
  // We can add effects, for example: transform: translateX(currentX + 'px');
 }

 function endSwipe(e) {
  e.preventDefault();
  e.stopPropagation();
  moving = false;
  if (currentX > threshold) {
   currentX = window.innerWidth;
   setTimeout(onYes, 300);
  } else if (currentX < -threshold) {
   currentX = -window.innerWidth;
   setTimeout(onNo, 300);
  } else {
   currentX = 0;
  }
 }

 function onYes() {
  console.log('Yes');
 }

 function onNo() {
  console.log('No');
 }
</script>

<style>
 .photo-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 400px;
  border-radius: 10px;
  background-color: #eee;
  overflow: hidden;
  /*align-items: center;
  justify-content: space-between;*/
  touch-action: pan-y;
  transition: transform 0.3s ease-out;
 }

 .photo-card.moving {
  transition: none;
 }

 .photo-card img {
  width: 100%;
  height: auto;
  object-fit: cover;
 }

 .photo-card .overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  z-index: 2;
  padding: 10px;
  text-align: center;
 }

 .buttons {
  display: flex;
  width: 100%;
  justify-content: space-around;
  margin-bottom: 10px;
  z-index: 3000;
 }
</style>

<div class="photo-card {moving ? 'moving' : ''}" style="transform: translateX({currentX}px)" on:touchstart={e => startSwipe(e)} on:touchmove={e => moveSwipe(e)} on:touchend={e => endSwipe(e)}>
 <img src={photo.img} alt={photo.name} />
 <div class="overlay">
  <h2>{photo.name}</h2>
  <p>{photo.description}</p>
 </div>
 <div class="buttons">
  <CardButton on:click={onNo} content="👎" />
  <CardButton on:click={onYes} content="👍" />
 </div>
</div>
