<script>
 import BaseButton from '../../../core/components/base-button.svelte';
 export let text;
 export let onClick;
</script>

<style>
 .dropdown {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border: 0;
  border-radius: 10px;
  font-family: inherit;
  background-color: #ffa;
 }

 .dropdown .text {
  flex-grow: 1;
 }

 .dropdown img {
  width: 15px;
  height: 15px;
 }
</style>

<BaseButton {onClick}>
 <div class="dropdown">
  <div class="text">{text}</div>
  <img src="img/down-black.svg" alt="▼" />
 </div>
</BaseButton>
