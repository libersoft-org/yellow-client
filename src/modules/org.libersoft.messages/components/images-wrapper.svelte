<script>
 let { children, node } = $props();
 const childrenLength = node?.childNodes.length || 0;
 let rowSize = 4
 let rowLimit = 2
 let hiddenImages = []
 let siblings = $derived(children.map(child => child))

 let imagesRows = $derived.by(() => {
   let groups = [];
   let group = [];
   children.forEach((child, index) => {
    if (!child.component) {
     console.info('Can\'t render child with no component', child);
     return;
    }

    // if rowLimit ís reached and last row is full - add remaining images to hidden group
    if (groups.length === rowLimit && groups[groups.length - 1].length === rowSize) {
       hiddenImages.push(child);
       return;
    } else {
     group.push(child);
    }
    if (group.length === rowSize || index === children.length - 1) {
       groups.push(group);
       group = [];
    }
   });
   return groups;
 })
</script>

<div
 class="images-wrap"
 data-children-length="{childrenLength}"
 style="--images-group-size: {rowSize};"
 style:margin-bottom="var(--images-gap)"
>
 {#each imagesRows as row, rowIndex (rowIndex)}
  <div
   class="images"
   style:margin-bottom="{rowIndex === imagesRows.length - 1 ? 0 : 'var(--images-gap)'}"
  >
   {#each row as child, childIndex (child.tagUniqueId)}
    {@const isLastOfAll = rowIndex === rowLimit - 1 && childIndex === row.length - 1}
    <svelte:component
      this={child.component}
      {...child.props}
      showHiddenImages={isLastOfAll && hiddenImages.length > 0}
      hiddenImages={hiddenImages}
      siblings={siblings}
    />
   {/each}
  </div>
 {/each}
</div>

<style>
 .images-wrap {
  --images-gap: 4px;
 }

 .images {
  display: flex;
  gap: var(--images-gap);
  width: 100%;
 }

 .images > :global(.message-content-image-wrapper) {
 }

 .images :global(.message-content-image) {
  --image-size: min(120px, calc(60 * var(--messages-list-width) / 100 / 4 - var(--images-group-size) * var(--images-gap)));
  display: flex;
  flex: 1 1;
  max-width: var(--image-size);
  min-width: var(--image-size);
  /*width: 100%;*/
  /*height: 100%;*/
 }
 .images :global(.message-content-image img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 50%;
 }

 @container (max-width: 300px) {
 }
</style>

<div class="images-wrap">
 <div class="images" data-children-length={childrenLength}>
  {@render children?.()}
 </div>
</div>
