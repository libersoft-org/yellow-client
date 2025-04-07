<script>
 import { onMount } from 'svelte';

 export let checked;
 let mounted = false;

 function keyPress(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   checked = !checked;
  }
 }

 onMount(() => {
  requestAnimationFrame(() => {
   mounted = true;
  });
 });
</script>

<style>
 .switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
 }

 .switch input {
  opacity: 0;
  width: 0;
  height: 0;
 }

 .switch .slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 34px;
  cursor: pointer;
 }

 .transition {
  -webkit-transition: 0.4s;
  transition: 0.4s;
 }

 .transition:before {
  -webkit-transition: 0.4s;
  transition: 0.4s;
 }

 .switch .slider:before {
  position: absolute;
  content: '';
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  border-radius: 50%;
 }

 input:checked + .slider {
  background-color: #fd1;
 }

 input:checked + .slider:before {
  transform: translateX(26px);
 }

 .switch input:focus-visible + .slider {
  outline: auto;
 }
</style>

<label class="switch">
 <input type="checkbox" bind:checked on:keydown={keyPress} />
 <span class="slider {mounted ? 'transition' : ''}"></span>
</label>
