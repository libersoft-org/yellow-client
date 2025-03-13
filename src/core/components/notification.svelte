<script>
 import BaseButton from './base-button.svelte';
 export let title = 'TITLE';
 export let description = 'DESCRIPTION';
 export let bgcolor = '#222';
 export let color = '#fff';
 export let img;
 //TODO: close notifications (X)

 function clickNotification() {
  console.log('Clicked on notification');
 }
</script>

<style>
 .notification {
  display: flex;
  gap: 10px;
  padding: 10px;
  border: 1px solid #000;
  border-radius: 10px;
 }

 .right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
 }

 .left .image {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  overflow: hidden;
 }

 .left .image img {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
 }

 .right .title {
  font-size: 20px;
  font-weight: bold;
 }

 .right .description {
  color: #888;
 }
</style>

<BaseButton onClick={clickNotification}>
 <div class="notification" style:background-color={bgcolor} style:color>
  <div class="left">
   {#if img}
    <div class="image">
     <img src={img} alt="" />
    </div>
   {/if}
  </div>
  <div class="right">
   <div class="title">{title}</div>
   <div class="description">{description}</div>
  </div>
 </div>
</BaseButton>
