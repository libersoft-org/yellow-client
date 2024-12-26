<script>
 import BaseButton from '../../../core/components/base-button.svelte';
 export let name = '';
 export let text = '';

 function clickReply() {
  console.log('This will focus the original message');
 }
</script>

<style>
 .reply {
  display: flex;
  flex-direction: column;
  padding: 4px 0 4px 10px;
  border: 1px solid #080;
  border-radius: 10px;
  border-left: 8px solid #080;
  margin: 0 0 5px 0;
 }

 .reply .name {
  font-size: 12px;
  font-weight: bold;
  color: #080;
 }

 .reply .text {
  color: #555;
 }
</style>

<BaseButton onClick={clickReply}>
 <div class="reply">
  <div class="name">{name}</div>
  <div class="text">{text}</div>
 </div>
</BaseButton>
