<script>
 import { onMount } from 'svelte';
 import Content from '../components/content.svelte';
 import Panel from '../components/panel.svelte';
 import { getLikes, likeProfile, selectProfile } from '../dating.js';
 import { likes } from '../dating.js';

 let account;
 let activeTab = 'received';

 onMount(() => {
  // Get the account from the parent component
  account = window.yellowAccount;
  if (account) {
   getLikes(account);
  }
 });

 function setTab(tab) {
  activeTab = tab;
 }

 function handleLike(profile) {
  if (account && profile.id) {
   likeProfile(account, profile.id);
  }
 }

 function viewProfile(profile) {
  selectProfile(profile);
 }
</script>

<style>
 .tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
 }

 .tab {
  padding: 10px 20px;
  cursor: pointer;
  font-weight: bold;
 }

 .tab.active {
  border-bottom: 3px solid #4a90e2;
  color: #4a90e2;
 }

 .likes-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
 }

 .like-card {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
 }

 .like-image {
  width: 100%;
  height: 200px;
  position: relative;
 }

 .like-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
 }

 .like-info {
  padding: 15px;
 }

 .like-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 5px 0;
 }

 .like-date {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
 }

 .like-actions {
  display: flex;
  justify-content: space-between;
  padding: 0 15px 15px;
  gap: 10px;
 }

 .action-button {
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  text-align: center;
  flex: 1;
 }

 .view-button {
  background-color: #f0f0f0;
  color: #333;
 }

 .like-button {
  background-color: #ff6b6b;
  color: white;
 }

 .no-likes {
  text-align: center;
  padding: 30px;
  color: #666;
 }
</style>

<Panel label="Likes" />
<Content>
 <div class="tabs">
  <div class="tab {activeTab === 'received' ? 'active' : ''}" on:click={() => setTab('received')}>Received</div>
  <div class="tab {activeTab === 'sent' ? 'active' : ''}" on:click={() => setTab('sent')}>Sent</div>
 </div>

 {#if activeTab === 'received'}
  {#if $likes.received && $likes.received.length > 0}
   <div class="likes-list">
    {#each $likes.received as like (like.id)}
     <div class="like-card">
      <div class="like-image">
       {#if like.profile.photos && like.profile.photos.length > 0}
        <img src={like.profile.photos[0]} alt={like.profile.displayName} />
       {:else}
        <img src="modules/org.libersoft.dating2/img/default-profile.svg" alt="Default profile" />
       {/if}
      </div>

      <div class="like-info">
       <h3 class="like-name">{like.profile.displayName}</h3>
       <div class="like-date">Liked you on {new Date(like.timestamp).toLocaleDateString()}</div>
      </div>

      <div class="like-actions">
       <button class="action-button view-button" on:click={() => viewProfile(like.profile)}> View Profile </button>
       <button class="action-button like-button" on:click={() => handleLike(like.profile)}> Like Back </button>
      </div>
     </div>
    {/each}
   </div>
  {:else}
   <div class="no-likes">
    <p>You haven't received any likes yet.</p>
    <p>Complete your profile to attract more attention!</p>
   </div>
  {/if}
 {:else if $likes.sent && $likes.sent.length > 0}
  <div class="likes-list">
   {#each $likes.sent as like (like.id)}
    <div class="like-card">
     <div class="like-image">
      {#if like.profile.photos && like.profile.photos.length > 0}
       <img src={like.profile.photos[0]} alt={like.profile.displayName} />
      {:else}
       <img src="modules/org.libersoft.dating2/img/default-profile.svg" alt="Default profile" />
      {/if}
     </div>

     <div class="like-info">
      <h3 class="like-name">{like.profile.displayName}</h3>
      <div class="like-date">You liked on {new Date(like.timestamp).toLocaleDateString()}</div>
     </div>

     <div class="like-actions">
      <button class="action-button view-button" on:click={() => viewProfile(like.profile)}> View Profile </button>
     </div>
    </div>
   {/each}
  </div>
 {:else}
  <div class="no-likes">
   <p>You haven't liked anyone yet.</p>
   <p>Browse profiles and start liking!</p>
  </div>
 {/if}
</Content>
