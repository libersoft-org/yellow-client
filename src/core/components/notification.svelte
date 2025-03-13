<script>
 import BaseButton from './base-button.svelte';
 import Button from './button.svelte';
 export let title;
 export let description;
 export let bgcolor = '#222';
 export let color = '#fff';
 export let img;
 export let titleMaxLines = 1;
 export let descMaxLines = 3;
 export let buttons = [];
 export let onClick;
 //TODO: close notifications (X)
</script>

<style>
 .notification {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
  box-shadow: var(--shadow);
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
  color: #888;
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
</style>

<BaseButton {onClick}>
 <div class="notification" style:background-color={bgcolor} style:color>
  {#if img || title || description}
   <div class="top">
    <div class="left">
     {#if img}
      <div class="image">
       <img src={img} alt="" />
      </div>
     {/if}
    </div>
    <div class="right">
     {#if title}
      <div class="title" style:-webkit-line-clamp={titleMaxLines}>{title}</div>
     {/if}
     {#if description}
      <div class="description" style:-webkit-line-clamp={descMaxLines}>{description}</div>
     {/if}
    </div>
   </div>
  {/if}
  <div class="bottom">
   <div class="buttons">
    {#each buttons as b}
     <Button text={b.text} onClick={b.onClick} expand={b.expand} />
    {/each}
   </div>
  </div>
 </div>
</BaseButton>
