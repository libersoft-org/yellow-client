<script lang="ts">
 import type { Snippet } from 'svelte';

 type Props = {
  children: Snippet;
  bare?: boolean;
  appended?: boolean;
  prepended?: boolean;
  background?: string;
  size?: 'lg' | '';
 };

 const { bare, appended, prepended, size = '', background, children, ...restProps }: Props = $props();
</script>

<style>
 section {
  position: relative;
  padding-top: clamp(32px, 4vw, 72px);
  padding-bottom: clamp(32px, 4vw, 72px);

  &.lg {
   padding-top: clamp(48px, 8vw, 120px);
   padding-bottom: clamp(48px, 8vw, 120px);
  }
 }

 /* &.appended 
			padding-top 0

		&.prepended 
			padding-bottom 0

		&.bare 
			padding-top 0
			padding-bottom 0 */
</style>

<section class:appended class:prepended class:lg={size === 'lg'} class:bare {...restProps}>
 {@render children()}
</section>
