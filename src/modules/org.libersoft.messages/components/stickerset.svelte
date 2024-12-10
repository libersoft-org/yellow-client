<script>
 import Item from './stickerset-item.svelte';
 export let onClick;
 const stickers = ['https://fonts.gstatic.com/s/e/notoemoji/latest/1f600/lottie.json', 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f603/lottie.json', 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f604/lottie.json', 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f601/lottie.json', 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f606/lottie.json', 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f602/lottie.json', 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f923/lottie.json', 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f62d/lottie.json', 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f609/lottie.json', 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f617/lottie.json', 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f619/lottie.json', 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f61a/lottie.json', 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f618/lottie.json', 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/lottie.json', 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f60d/lottie.json', 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f929/lottie.json', 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f973/lottie.json', 'https://fonts.gstatic.com/s/e/notoemoji/latest/1fae0/lottie.json', 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f643/lottie.json', 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f642/lottie.json'];

 function selectSticker(file) {
  console.log('SELECTING STICKER:', file);
 }
</script>

<style>
 .stickerset {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
 }

 .stickerset .label {
  font-weight: bold;
 }

 .stickerset .set {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  width: 420px;
  max-width: 100%;
 }
</style>

<div class="stickerset">
 <div class="label">Standard stickers</div>
 <div class="set">
  {#each stickers as s}
   <Item file={s} on:click={() => selectSticker(s)} />
  {/each}
 </div>
</div>
