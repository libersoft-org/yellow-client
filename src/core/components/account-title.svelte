<script>
 export let a;
</script>

<style>
 .account-title {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
 }
</style>

<div class="account-title">
 {#if $a.settings?.title}{$a.settings?.title} -
 {/if}{$a.credentials?.address}
</div>
