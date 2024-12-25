<script>
 import Select from '../../../core/components/select.svelte';
 import Option from '../../../core/components/select-option.svelte';
</script>

<style>
 .group {
  display: flex;
  flex-direction: column;
  gap: 5px;
 }

 .group .title {
  padding-left: 5px;
  font-weight: bold;
 }
</style>

<div class="group">
 <div class="title">Currency conversion:</div>
 <div class="select">
  <Select>
   <Option value="0" text="--- Select your currency ---" />
   <Option value="1" text="USD" />
  </Select>
 </div>
</div>
