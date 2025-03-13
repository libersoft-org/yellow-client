<script>
 import '../../app.css';
 import { writable } from 'svelte/store';
 import Notification from '../../core/components/notification.svelte';
 //let notifications = writable([]);
</script>

<style>
 .notifications {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: yellow;
 }
</style>

<div class="notifications">
 <Notification />
 <Notification />
 <Notification />
 <Notification />
</div>
