<script>
 import Core from '../../../core/core.js';
 import Item from '../components/sidebar-item.svelte';
 import { page, online } from '../dating.js';

 function setPage(name) {
  page.set(name);
  Core.hideSidebarMobile.set(true);
 }
</script>

<style>
 .sidebar {
  overflow-y: auto;
 }

 .status {
  padding: 10px;
  font-size: 12px;
  color: #666;
  text-align: center;
  border-bottom: 1px solid #ddd;
 }

 .online {
  color: green;
 }

 .offline {
  color: red;
 }
</style>

<div class="sidebar">
 <div class="status">
  Status: <span class={$online ? 'online' : 'offline'}>{$online ? 'Online' : 'Offline'}</span>
 </div>
 <Item img="people.svg" label="People nearby" onClick={() => setPage('people')} />
 <Item img="heart.svg" label="Matches" onClick={() => setPage('matches')} />
 <Item img="like.svg" label="Likes" onClick={() => setPage('likes')} />
 <Item img="profile.svg" label="My Profile" onClick={() => setPage('myprofile')} />
 <Item img="settings.svg" label="Settings" onClick={() => setPage('settings')} />
</div>
