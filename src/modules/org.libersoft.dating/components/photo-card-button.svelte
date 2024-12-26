<script>
 import BaseButton from '../../../core/components/base-button.svelte';
 export let content;
 export let onClick;
</script>

<style>
 .photo-card-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: 1px solid #000;
  border-radius: 50%;
  box-shadow: var(--shadow);
 }
</style>

<BaseButton {onClick}>
 <div class="photo-card-button">{content}</div>
</BaseButton>
