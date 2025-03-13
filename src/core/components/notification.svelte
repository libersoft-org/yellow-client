<script>
 import BaseButton from './base-button.svelte';
 import Button from './button.svelte';
 export let data;
 export let onClose;
 export let closing = false;

 function handleClosing() {
  closing = true;
  setTimeout(() => {
   onClose();
  }, 400);
 }
</script>

<style>
 .notification {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
  box-shadow: var(--shadow);
  animation: messageAppear 0.4s ease-out;
 }

 .notification.closing {
  animation: messageDisappear 0.4s ease-in forwards;
 }

 @keyframes messageAppear {
  from {
   transform: scale(0);
  }
  to {
   transform: scale(1);
  }
 }

 @keyframes messageDisappear {
  from {
   transform: scale(1);
   opacity: 1;
  }
  to {
   transform: scale(0);
   opacity: 0;
  }
 }

 .top {
  display: flex;
  gap: 10px;
 }

 .top .right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
 }

 .top .left .image {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  overflow: hidden;
 }

 .top .left .image img {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
 }

 .top .right .title {
  font-size: 18px;
  font-weight: bold;
 }

 .top .right .description {
  font-size: 14px;
  text-align: justify;
 }

 .top .right .title,
 .top .right .description {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
 }

 .bottom .buttons {
  display: flex;
  gap: 10px;
 }

 .close {
  z-index: 10;
  position: absolute;
  right: 0;
  top: 0;
  padding: 10px;
  width: 20px;
  height: 20px;
  overflow: hidden;
  cursor: pointer;
  border-radius: 10px;
 }

 .close:hover {
  background-color: rgb(255, 255, 255, 0.075);
 }
</style>

<BaseButton onClick={data.onClick}>
 <div class="notification {closing && 'closing'}" style:background-color={data.bgColor ? data.bgColor : '#222'}>
  {#if data.img || data.title || data.description}
   <div class="top">
    {#if data.img}
     <div class="left">
      <div class="image">
       <img src={data.img} alt="" />
      </div>
     </div>
    {/if}
    <div class="right">
     {#if data.title}
      <div class="title" style:color={data.titleColor ? data.titleColor : '#fff'} style:-webkit-line-clamp={data.titleMaxLines ? data.titleMaxLines : 1}>{data.title}</div>
     {/if}
     {#if data.description}
      <div class="description" style:color={data.descColor ? data.descColor : '#888'} style:-webkit-line-clamp={data.descMaxLines ? data.descMaxLines : 3}>{data.description}</div>
     {/if}
    </div>
   </div>
  {/if}
  {#if data.buttons}
   <div class="bottom">
    <div class="buttons">
     {#each data.buttons as b}
      <Button text={b.text} onClick={b.onClick} expand={b.expand} />
     {/each}
    </div>
   </div>
  {/if}
 </div>
</BaseButton>
<BaseButton onClick={handleClosing}>
 <div class="close">
  <img src="img/close.svg" alt="Close" />
 </div>
</BaseButton>
