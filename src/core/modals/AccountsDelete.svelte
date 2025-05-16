<script lang="ts">
 import Button from '@/core/components/Button/Button.svelte';
 import { delAccount } from '../accounts_config.js';

 type Props = {
  close: () => void;
  params: {
   id: string;
   name: string;
  };
 };

 let { close, params = $bindable() }: Props = $props();

 function clickDel() {
  console.log('clickDel');
  delAccount(params.id);
  close();
 }
</script>

<div>Would you like to delete the account "<span class="bold">{params?.name}</span>" (id: <span class="bold">{params?.id}</span>)?</div>
<Button text="Delete" onClick={clickDel} />
