<script lang="ts">
 import { lightenColor } from '@/core/utils/colorUtils';

 interface Props {
  width?: string;
  height?: string;
  borderRadius?: string;
  baseColor?: string;
 }

 let { width = '100%', height = '1rem', borderRadius = '0.5rem', baseColor = '#e5d193' }: Props = $props();

 let secondaryColor = $derived(lightenColor(baseColor, 0.1));
 let background = $derived(`linear-gradient(90deg, ${baseColor} 25%, ${secondaryColor} 50%, ${baseColor} 75%)`);
</script>

<style>
 .skeleton {
  /*
  background: linear-gradient(
   90deg,
   #e0e0e06b 25%,
   #f0f0f06b 50%,
   #e0e0e06b 75%
  );*/
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
 }

 @keyframes shimmer {
  0% {
   background-position: -200% 0;
  }
  100% {
   background-position: 200% 0;
  }
 }
</style>

<div class="skeleton" style:width style:height style:border-radius={borderRadius} style:background-image={background}></div>
