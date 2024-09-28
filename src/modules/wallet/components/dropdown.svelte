<script>
 export let text = '';
</script>

<style>
 .dropdown {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border-radius: 10px;
  background-color: #650;
  cursor: pointer;
 }

 .dropdown .text {
  flex-grow: 1;
 }

 .dropdown img {
  width: 20px;
  height: 20px;
 }
</style>

<div class="dropdown">
 <div class="text">{text}</div>
 <div><img src="img/down-black.svg" alt="▼" /></div>
</div>
