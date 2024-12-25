<script>
 export let label;
 export let active;
 export let onClick;
</script>

<style>
 .item {
  font-size: 14px;
  padding: 10px;
  color: #fff;
  cursor: pointer;
 }

 .item.active {
  font-weight: bold;
  text-decoration: underline;
  background-color: #444;
 }
</style>

<div class="item {active ? 'active' : ''}">{label}</div>
