<script>
 export let color = '#666';
 export let moving = false;
 export let value = 0;

 function lightenColor(hex, percent) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3)
   hex = hex
    .split('')
    .map(c => c + c)
    .join('');
  const num = parseInt(hex, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l;
  l = (max + min) / 2;
  if (max === min) h = s = 0;
  else {
   const d = max - min;
   s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
   switch (max) {
    case r:
     h = (g - b) / d + (g < b ? 6 : 0);
     break;
    case g:
     h = (b - r) / d + 2;
     break;
    case b:
     h = (r - g) / d + 4;
     break;
   }
   h /= 6;
  }
  l = Math.min(l + percent, 1);
  if (s === 0) {
   r = g = b = l;
  } else {
   function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
   }
   const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
   const p = 2 * l - q;
   r = hue2rgb(p, q, h + 1 / 3);
   g = hue2rgb(p, q, h);
   b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = x => {
   const hex = Math.round(x * 255).toString(16);
   return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
 }

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
