<script>
 import BaseButton from './base-button.svelte';
 import { log } from '../../core/tauri.ts';
 import { animationDuration, animationName, bgColor, titleColor, descColor } from '../notifications_settings.ts';
 export let data;
 export let closing = false;

 function handleClosing(e) {
  e.stopPropagation();
  //e.stopImmediatePropagation();
  closing = true;
  setTimeout(() => {
   data.onClose && data.onClose(e, 'close');
  }, animationDuration);
 }
</script>

<style>
 .notification {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
 }

 .notification.zoom-in {
  animation: zoom-in var(--anim-duration) ease-out;
 }

 .notification.zoom-out {
  animation: zoom-out var(--anim-duration) ease-in forwards;
 }

 .notification.opacity-in {
  animation: opacity-in var(--anim-duration) linear 1;
 }

 .notification.opacity-out {
  animation: opacity-out var(--anim-duration) linear 1;
 }

 @keyframes zoom-in {
  from {
   transform: scale(0);
  }
  to {
   transform: scale(1);
  }
 }

 @keyframes zoom-out {
  from {
   transform: scale(1);
  }
  to {
   transform: scale(0);
  }
 }

 @keyframes opacity-in {
  0% {
   opacity: 0;
  }
  100% {
   opacity: 1;
  }
 }

 @keyframes opacity-out {
  0% {
   opacity: 1;
  }
  100% {
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

 .top .right .body {
  font-size: 14px;
  text-align: justify;
 }

 .top .right .title,
 .top .right .body {
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

<BaseButton
 onClick={e => {
  log.debug('***onClick');
  data.onClick(e, 'click');
 }}
>
 <div class="notification {$animationName && $animationName + '-' + (closing ? 'out' : 'in')}" style="--anim-duration: {$animationDuration}ms; background-color:{$bgColor}">
  {#if data.img || data.title || data.body}
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
      <div class="title" style:color={$titleColor} style:-webkit-line-clamp={data.titleMaxLines ? data.titleMaxLines : 1}>{data.title}</div>
     {/if}
     {#if data.body}
      <div class="body" style:color={$descColor} style:-webkit-line-clamp={data.descMaxLines ? data.descMaxLines : 3}>{data.body}</div>
     {/if}
    </div>
   </div>
  {/if}
  {#if data.buttons}
   <div class="bottom">
    <div class="buttons">
     {#each data.buttons as b}
      <BaseButton text={b.text} onClick={e => b.onClick(b, b.id)} expand={b.expand} />
     {/each}
    </div>
   </div>
  {/if}
  <BaseButton
   onClick={e => {
    log.debug('***onClose');
    handleClosing(e);
   }}
  >
   <div class="close">
    <img src="img/close.svg" alt="Close" />
   </div>
  </BaseButton>
 </div>
</BaseButton>
