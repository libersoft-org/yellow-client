<script>
 export let items = [];
 let activeIndex = null;

 function clickToggle(index) {
  activeIndex = activeIndex === index ? null : index;
 }

 function keyToggle(index) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickToggle(index);
  }
 }
</script>

<style>
 .accordion {
  border: 1px solid #b90;
  border-radius: 10px;
  overflow: hidden;
 }

 .accordion .item {
  border-bottom: 1px solid #b90;
 }

 .accordion .item .header {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #fd1;
  cursor: pointer;
 }

 .accordion .item .header .title {
  flex-grow: 1;
 }

 .accordion .item .header img {
  width: 12px;
  height: 12px;
 }

 .accordion .item .content {
  padding: 1em;
  display: none;
 }

 .accordion .item .content.active {
  display: block;
 }
</style>

<div class="accordion">
 {#each items as i, index}
  <div class="item">
   <div class="header" role="button" tabindex="0" on:click={() => clickToggle(index)} on:keydown={() => keyToggle(index)}>
    <div class="title">{i.name}</div>
    <img src="img/down-black.svg" alt="▼" />
   </div>
   <div class="content {activeIndex === index ? 'active' : ''}">
    <slot prop={i} />
   </div>
  </div>
 {/each}
</div>
