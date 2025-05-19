<script>
 import BaseButton from '@/core/components/Button/BaseButton.svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';
 export let address;
 let copied = false;

 function clickCopyAddress() {
  navigator.clipboard
   .writeText(address)
   .then(() => {
    copied = true;
    setTimeout(() => (copied = false), 1000);
   })
   .catch(err => console.error('Error while copying to clipboard', err));
 }
</script>

<style>
 .address {
  display: flex;
  align-items: center;
  gap: 5px;
 }

 .clamp {
  display: inline-block;
  width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
 }
</style>

<BaseButton onClick={clickCopyAddress}>
 <div class="address">
  <span class="clamp" bind:this={spanElem}>{copied ? 'Copied!' : address}</span>
  <Icon img="img/copy.svg" alt="Copy" colorVariable="--icon-black" size="15px" padding="0px" />
 </div>
</BaseButton>
