<script>
 export let value = '';
 export let text = '';
 export let selected = false;
 export let disabled = false;
</script>

<option {value} {selected} {disabled}>{text}</option>
