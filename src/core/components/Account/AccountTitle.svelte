<script>
  export let a;
</script>

<div class="account-title">
  {#if $a.settings?.title}{$a.settings?.title} ({/if}{$a.credentials?.address}{#if $a.settings?.title}){/if}
</div>

<style>
  .account-title {
    flex: 1 1 auto;
    min-width: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
</style>
