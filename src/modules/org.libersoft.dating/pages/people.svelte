<script lang="ts">
  import Content from '../components/content.svelte';
  import TopBar from '@/core/components/TopBar/TopBar.svelte';
  import core, { isMobile } from '@/core/core.ts';
  import Icon from '@/core/components/Icon/Icon.svelte';
  import { page } from '../dating.ts';

  function modulePageClose() {
    page.set('');
    core.hideSidebarMobile.set(false);
  }
</script>

<TopBar>
  <svelte:fragment slot="left">
    {#if $isMobile}
      <Icon img="img/back.svg" onClick={() => modulePageClose()} colorVariable="--icon-white" visibleOnDesktop={true} />
    {/if}
    <h1 class="title">People nearby</h1>
  </svelte:fragment>
</TopBar>

<Content>
  {window.innerHeight}<br />
  {window.visualViewport?.height}<br />
  START 1<br />
  START 2<br />
  START 3<br />
  People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br
  />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br
  />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br
  />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br
  />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br
  />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br
  />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br
  />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br
  />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br
  />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br
  />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br
  />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br
  />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br
  />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br
  />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br
  />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />
  END 1<br />
  END 2<br />
  END 3<br />
</Content>
