<script>

 export let a;

</script>

{#if $a.settings?.title}{$a.settings?.title} - {/if}{$a.credentials?.address}
