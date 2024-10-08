<script>
 import Button from './button.svelte';
 export let steps = [];
 export let onClose;
 let currentStep = 0;

 function clickClose() {
  if (onClose) onClose();
 }

 function keyClose() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickClose();
  }
 }

 function nextStep() {
  if (currentStep < steps.length - 1) currentStep += 1;
 }

 function prevStep() {
  if (currentStep > 0) currentStep -= 1;
 }

 function finish() {
  clickClose();
 }
</script>

<div class="wizard">
 <div class="header">
  <div class="title">{steps[currentStep].title}</div>
  <div class="close" role="button" tabindex="0" on:click={clickClose} on:keydown={keyClose}><img src="img/close-black.svg" alt="X" /></div>
 </div>
 <div class="body">
  <div class="progress-bar">
   {#each steps as step, index}
    <div class="step">
     <div class="circle {index === currentStep ? 'active' : ''}">
      {index + 1}
     </div>
     {#if index < steps.length - 1}
      <div class="line"></div>
     {/if}
    </div>
   {/each}
  </div>
  <div class="content">
   <svelte:component this={steps[currentStep].component} />
  </div>
  <div class="navigation">
   {#if currentStep > 0}
    <Button on:click={prevStep} text="Previous" />
   {/if}
   <div class="gap"></div>
   {#if currentStep < steps.length - 1}
    <Button on:click={nextStep} text="Next" />
   {:else}
    <Button on:click={finish} text="Finish" />
   {/if}
  </div>
 </div>
</div>

<style>
 .wizard {
  z-index: 100;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 50%;
  left: 50%;
  max-width: calc(100% - 20px);
  max-height: calc(100% - 20px);
  transform: translate(-50%, -50%);
  border: 1px solid #000;
  border-radius: 10px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: var(--shadow);
 }

 .wizard .header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  cursor: pointer;
  font-weight: bold;
  background-color: #fd3;
  color: #000;
 }

 .wizard .header .title {
  flex-grow: 1;
 }

 .wizard .header .close img {
  width: 20px;
  height: 20px;
 }

 .progress-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
 }

 .progress-bar .step {
  display: flex;
  align-items: center;
 }

 .progress-bar .step .circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #ccc;
  text-align: center;
  line-height: 30px;
  position: relative;
 }

 .progress-bar .step .circle.active {
  border: 1px solid #d80;
  background-color: #fd3;
  color: #000;
 }

 .progress-bar .step .line {
  width: 50px;
  height: 2px;
  background-color: #ccc;
 }

 .wizard .body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  overflow-y: auto;
  background-color: #fff;
  color: #000;
 }

 .navigation {
  display: flex;
  gap: 10px;
 }

 .navigation .gap {
  flex-grow: 1;
 }
</style>
