<script>
 import { onMount } from 'svelte';
 import Content from '../components/content.svelte';
 import Panel from '../components/panel.svelte';
 import { getMatches, selectProfile } from '../dating.js';
 import { matches } from '../dating.js';

 let account;

 onMount(() => {
  // Get the account from the parent component
  account = window.yellowAccount;
  if (account) {
   getMatches(account);
  }
 });

 function viewProfile(match) {
  selectProfile(match.profile);
 }
</script>

<style>
 .matches-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
 }

 .match-card {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
 }

 .match-image {
  width: 100%;
  height: 200px;
  position: relative;
 }

 .match-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
 }

 .match-info {
  padding: 15px;
 }

 .match-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 5px 0;
 }

 .match-date {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
 }

 .match-actions {
  display: flex;
  justify-content: space-between;
  padding: 0 15px 15px;
 }

 .action-button {
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  text-align: center;
  width: 100%;
  background-color: #4a90e2;
  color: white;
 }

 .no-matches {
  text-align: center;
  padding: 30px;
  color: #666;
 }
</style>

<Panel label="Your Matches" />
<Content>
 {#if $matches && $matches.length > 0}
  <div class="matches-list">
   {#each $matches as match (match.id)}
    <div class="match-card">
     <div class="match-image">
      {#if match.profile.photos && match.profile.photos.length > 0}
       <img src={match.profile.photos[0]} alt={match.profile.displayName} />
      {:else}
       <img src="modules/org.libersoft.dating2/img/default-profile.svg" alt="Default profile" />
      {/if}
     </div>

     <div class="match-info">
      <h3 class="match-name">{match.profile.displayName}</h3>
      <div class="match-date">Matched on {new Date(match.matchDate).toLocaleDateString()}</div>
     </div>

     <div class="match-actions">
      <button class="action-button" on:click={() => viewProfile(match)}> View Profile </button>
     </div>
    </div>
   {/each}
  </div>
 {:else}
  <div class="no-matches">
   <p>You don't have any matches yet.</p>
   <p>Keep liking profiles to find your match!</p>
  </div>
 {/if}
</Content>
