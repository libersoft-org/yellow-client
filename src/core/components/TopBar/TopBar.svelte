<style>
 .top-bar {
  display: flex;
  flex-direction: row;
  position: sticky;
  top: 0;
  align-items: center;
  gap: 24px;
  min-height: calc(var(--menu-height) - 20px);
  background-color: #222;
  color: #fff;
  box-shadow: var(--shadow);
  padding: 10px 20px;

  @media (max-width: 768px) {
   padding: 10px;
  }

  .left,
  .center,
  .right {
   display: flex;
   flex-direction: row;
   align-items: center;
   gap: 10px;
   flex: 1;
   width: 100%;

   /* :global(&:has(:only-child)) {
				.left,
				.center,
				.right {
					gap: 0;
				}
			} */

   :global(h1) {
    white-space: nowrap;
    margin: 0 !important;
    font-size: 24px;
   }
  }

  .center {
   justify-content: center;
  }

  .right {
   justify-content: end;
  }
 }
</style>

<div class="top-bar">
 <slot />

 <div class="left">
  <slot name="left" />
 </div>

 <div class="center">
  <slot name="center" />
 </div>

 <div class="right">
  <slot name="right" />
 </div>
</div>
