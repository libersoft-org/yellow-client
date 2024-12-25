<script>
 export let img;
 export let alt = '';
 export let value;
 export let placeholder;
 export let onClick;

 function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   onClick && onClick();
  }
 }
</script>

<style>
 .input-button {
  display: flex;
  align-items: center;
  border: 1px solid #888;
  border-radius: 10px;
  padding: 5px;
 }

 input {
  width: 100%;
  border: 0;
  font-family: inherit;
  font-size: inherit;
 }

 .image {
  padding: 5px;
  cursor: pointer;
 }

 .image img {
  display: flex;
  width: 20px;
  height: 20px;
 }
</style>

<div class="input-button">
 <input type="text" {value} {placeholder} />
 <div class="image" role="button" tabindex="0" on:click={onClick} on:keydown={handleKeydown}>
  <img src={img} {alt} />
 </div>
</div>
