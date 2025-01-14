<script>
 export let checked;

 function keyPress() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   checked = !checked;
  }
 }
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
  -webkit-transition: 0.4s;
  transition: 0.4s;
  border-radius: 34px;
  cursor: pointer;
 }

 .switch .slider:before {
  position: absolute;
  content: '';
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
  border-radius: 50%;
 }

 input:checked + .slider {
  background-color: #fd1;
 }

 input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
 }

 .switch input:focus-visible + .slider {
  outline: auto;
 }
</style>

<label class="switch">
 <input type="checkbox" bind:checked on:keydown={keyPress} />
 <span class="slider"></span>
</label>
