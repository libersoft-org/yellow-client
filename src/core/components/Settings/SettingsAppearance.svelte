<script lang="ts">
  import Select from '@/core/components/Select/Select.svelte';
  import Option from '@/core/components/Select/SelectOption.svelte';
  import Table from '@/core/components/Table/Table.svelte';
  import Thead from '@/core/components/Table/TableThead.svelte';
  import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
  import TheadTh from '@/core/components/Table/TableTheadTh.svelte';
  import Tbody from '@/core/components/Table/TableTbody.svelte';
  import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
  import TbodyTd from '@/core/components/Table/TableTbodyTd.svelte';
  import { TAURI } from '@/core/tauri.ts';
  import { zoom } from '@/core/settings.ts';
  import { setZoom } from '@/core/zoom.ts';
  import Input from '@/core/components/Input/Input.svelte';
  import { selected_theme_index, current_theme, themes_stored, default_theme } from '../../appearance_store.ts';

  import Icon from '../Icon/Icon.svelte';
  import Button from '../Button/Button.svelte';

  $effect(() => {
    $themes_stored;
    $current_theme.properties;
    $selected_theme_index;
  });

  let theme_properties = Object.entries($current_theme.properties);

  let expanded = $state(false);

  // String version for Select component
  let selectedThemeString = $derived($selected_theme_index.toString());

  function handleThemeChange(value: string) {
    selected_theme_index.set(parseInt(value, 10));
  }

  function click_expand() {
    expanded = !expanded;
    console.log(expanded);
  }

  function create_new_theme() {
    let new_theme = JSON.parse(JSON.stringify(default_theme));
    new_theme.name = 'New Theme';
    themes_stored.update((arr) => [...arr, new_theme]);
    $selected_theme_index = $themes_stored.length - 1;
  }

  function delete_current_theme() {
    if ($themes_stored.length > 1 && $selected_theme_index > 0) {
      let current_index = $selected_theme_index;
      $selected_theme_index = 0;
      themes_stored.update((arr) => arr.filter((theme) => $themes_stored.indexOf(theme) !== current_index));
    }
  }
</script>

<Table>
  <Thead>
    <TheadTr>
      {#if TAURI}
        <TheadTh>Zoom:</TheadTh>
      {/if}
      <TheadTh>Theme:</TheadTh>
    </TheadTr>
  </Thead>
  <Tbody>
    <TbodyTr>
      {#if TAURI}
        <TbodyTd title="Zoom">
          <span>{Math.round(($zoom || 0) * 100)}%</span>
          <div class="zoom">
            <input type="range" min="0.3" max="3" step="0.1" bind:value={$zoom} onchange={setZoom} />
          </div>
        </TbodyTd>
      {/if}
      <TbodyTd title="Theme">Theme:</TbodyTd>
      <TbodyTd title="Theme selector">
        {#if expanded}
          <Button onClick={click_expand}>
            <Icon img="img/edit.svg" alt="Close" colorVariable="--color-primary-foreground" size="20px" padding="0px" />
          </Button>
        {:else}
          <Select
            value={selectedThemeString}
            onchange={(e) => handleThemeChange((e.target as HTMLSelectElement).value)}
          >
            {#each $themes_stored as theme, index (theme.name + index)}
              <Option text={theme.name} value={index.toString()} />
            {/each}
          </Select>
          {#if $selected_theme_index > 0}
            <Button onClick={click_expand}>
              <Icon
                img="img/edit.svg"
                alt="Close"
                colorVariable="--color-primary-foreground"
                size="20px"
                padding="0px"
              />
            </Button>
          {/if}
          <Button
            onClick={() => {
              click_expand();
              create_new_theme();
            }}
          >
            <Icon img="img/add.svg" alt="Close" colorVariable="--color-primary-foreground" size="20px" padding="0px" />
          </Button>
          {#if $selected_theme_index > 0}
            <Button onClick={delete_current_theme}>
              <Icon
                img="img/del.svg"
                alt="Close"
                colorVariable="--color-primary-foreground"
                size="20px"
                padding="0px"
              />
            </Button>
          {/if}
        {/if}
      </TbodyTd>
    </TbodyTr>
  </Tbody>

  <Table>
    <Tbody>
      <TbodyTr>
        {#if expanded}
          <TbodyTd title="Name">
            <Input type="text" bind:value={$themes_stored[$selected_theme_index].name} />
          </TbodyTd>

          <TbodyTr>
            {#each theme_properties as theme_property_name}
              <TbodyTd title={theme_property_name[0]}>
                <input
                  type="color"
                  bind:value={$themes_stored[$selected_theme_index].properties[theme_property_name[0]]}
                />

                {$themes_stored[$selected_theme_index].properties[theme_property_name[0]]}
              </TbodyTd>
            {/each}
          </TbodyTr>
        {/if}
      </TbodyTr>
    </Tbody>
  </Table>
</Table>

<style>
  .zoom {
    display: flex;

    input {
      margin-top: 6px;
    }
  }
</style>
