<script>
  import Select from '@/core/components/Select/Select.svelte';
  import Option from '@/core/components/Select/SelectOption.svelte';
</script>

<div class="group">
  <div class="title">Currency conversion:</div>
  <div class="select">
    <Select>
      <Option value="1" text="USD" selected={true} />
    </Select>
  </div>
</div>

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
