<script>
 import Select from '../../../core/components/Select/Select.svelte';
 import SelectOption from '../../../core/components/Select/SelectOption.svelte';
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
   <SelectOption value="0" text="--- Select your currency ---" />
   <SelectOption value="1" text="USD" />
  </Select>
 </div>
</div>
