<script lang="ts">
 import Label from '@/core/components/Label/Label.svelte';

 type Props = {
  checked?: boolean;
  showLabel?: boolean;
  ariaLabel: string;
  orientation?: 'horizontal' | 'vertical';
 };

 let { checked = $bindable(), ariaLabel, showLabel = false, orientation = 'horizontal' }: Props = $props();

 let mounted = $state(false);
 let inputId = Math.random().toString(36);
 let labelId = `${inputId}-label`;

 function keyPress(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   checked = !checked;
  }
 }

 $effect(() => {
  requestAnimationFrame(() => {
   mounted = true;
  });
 });
</script>

<style>
 .switch {
  display: grid;
  grid-template-columns: repeat(2, auto);
  align-items: center;
  gap: 10px;

  &.vertical {
   grid-template-columns: unset;
   grid-template-rows: repeat(2, auto);
  }

  .label {
   font-weight: bold;
  }
 }

 .switch-wrapper {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
 }

 .switch input {
  position: absolute;
  opacity: 0.001;
  width: 60px;
  height: 34px;
  cursor: pointer;
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
  pointer-events: none;
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
  background-color: var(--color-primary-background);
 }

 input:checked + .slider:before {
  transform: translateX(26px);
 }

 .switch input:focus-visible + .slider {
  outline: auto;
 }

 .visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
 }
</style>

<Label>
 <span id={labelId} class="visually-hidden">{ariaLabel}</span>
 <div class={`switch ${orientation}`}>
  {#if showLabel}
   <span class="label">{`${ariaLabel}:`}</span>
  {/if}
  <div class="switch-wrapper">
   <input id={inputId} aria-labelledby={labelId} type="checkbox" bind:checked onkeydown={keyPress} />
   <span class="slider {mounted ? 'transition' : ''}"></span>
  </div>
 </div>
</Label>
