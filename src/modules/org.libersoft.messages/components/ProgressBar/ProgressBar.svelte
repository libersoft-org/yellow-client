<script>
 import { lightenColor } from "@/core/utils/colorUtils.js";

 export let color = '#666';
 export let moving = false;
 export let value = 0;

 $: lighterColor = lightenColor(color, 0.2);
</script>

<style>
 .progress-bar {
  width: calc(100% - 6px);
  height: 10px;
  border: 3px solid #000;
  background: #eee;
  overflow: hidden;
  position: relative;
  border-radius: 10px;
 }

 .fill {
  height: 100%;
  background: linear-gradient(-45deg, var(--base-color) 25%, var(--lighter-color) 25%, var(--lighter-color) 50%, var(--base-color) 50%, var(--base-color) 75%, var(--lighter-color) 75%, var(--lighter-color) 100%);
  background-size: 40px 40px;
  width: 0%;
  transition: width 0.3s ease;
 }

 .moving {
  animation: moveStripes 1s linear infinite;
 }

 @keyframes moveStripes {
  from {
   background-position: 0 0;
  }
  to {
   background-position: 40px 0;
  }
 }
</style>

<div class="progress-bar">
 <div class="fill {moving ? 'moving' : ''}" style="width: {value}%; --base-color: {color}; --lighter-color: {lighterColor};"></div>
</div>
