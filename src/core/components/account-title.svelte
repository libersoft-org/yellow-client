<script>
 export let a;
</script>

<style>
 .account-title {
  flex: 1 1 auto;
  min-width: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
 }
</style>

<div class="account-title">
 {#if $a.settings?.title}{$a.settings?.title} ({/if}{$a.credentials?.address}{#if $a.settings?.title}){/if}
</div>
