<script>
 import { networks } from '../wallet.ts';
 import { writable } from 'svelte/store';
 import Button from '../../../core/components/button.svelte';


 export let onClose;
 export let network = null;
 let item;

 export function modalEditNetworkSetItem(i)
 {
  item = i;
 }
</script>

<style>
 .modal-edit-network {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .modal-edit-network input {
  padding: 5px;
 }

 .modal-edit-network .buttons {
  display: flex;
  gap: 10px;
 }

 </style>

<div class="modal-edit-network">
 <div class="group">
  <div class="label">Name:</div>
  <input bind:value={item.name} />
 </div>
 <div class="group">
  <div class="label">Currency:</div>
  <input bind:value={item.currency} />
 </div>
 <div class="group">
  <div class="label">Icon URL:</div>
  <input bind:value={item.currency.iconURL} />
 </div>
 <div class="buttons">
  <Button on:click={() => onClose()}>Cancel</Button>
  <Button on:click={() => {networks.update(n => n.map(n => n.name === item.name ? item : n)); onClose();}}>Save</Button>
 </div>
</div>

