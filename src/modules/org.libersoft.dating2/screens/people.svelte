<script>
 import { onMount } from 'svelte';
 import Content from '../components/content.svelte';
 import Panel from '../components/panel.svelte';
 import ProfileCard from '../components/profile-card.svelte';
 import { searchProfiles, likeProfile, selectProfile } from '../dating.js';
 import { searchResults } from '../dating.js';

 let account;
 let searchParams = {
  gender: '',
  minAge: 18,
  maxAge: 99,
  location: '',
  limit: 20,
  offset: 0,
 };

 onMount(() => {
  // Get the account from the parent component
  account = window.yellowAccount;
  if (account) {
   loadProfiles();
  }
 });

 function loadProfiles() {
  searchProfiles(account, searchParams);
 }

 function handleLike(event) {
  const profile = event.detail;
  if (account && profile.id) {
   likeProfile(account, profile.id);
  }
 }

 function handleView(event) {
  const profile = event.detail;
  selectProfile(profile);
 }
</script>

<style>
 .search-controls {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
 }

 .search-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
 }

 .form-group {
  margin-bottom: 10px;
 }

 label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
 }

 select,
 input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
 }

 .search-button {
  grid-column: span 2;
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
 }

 .profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
 }

 .no-results {
  text-align: center;
  padding: 30px;
  color: #666;
 }
</style>

<Panel label="People Nearby" />
<Content>
 <div class="search-controls">
  <div class="search-form">
   <div class="form-group">
    <label for="gender">Gender</label>
    <select id="gender" bind:value={searchParams.gender}>
     <option value="">Any</option>
     <option value="male">Male</option>
     <option value="female">Female</option>
     <option value="other">Other</option>
    </select>
   </div>

   <div class="form-group">
    <label for="location">Location</label>
    <input type="text" id="location" bind:value={searchParams.location} placeholder="City, Country" />
   </div>

   <div class="form-group">
    <label for="minAge">Min Age</label>
    <input type="number" id="minAge" bind:value={searchParams.minAge} min="18" max="99" />
   </div>

   <div class="form-group">
    <label for="maxAge">Max Age</label>
    <input type="number" id="maxAge" bind:value={searchParams.maxAge} min="18" max="99" />
   </div>

   <button class="search-button" on:click={loadProfiles}>Search</button>
  </div>
 </div>

 <div class="profile-grid">
  {#if $searchResults && $searchResults.length > 0}
   {#each $searchResults as profile (profile.id)}
    <ProfileCard {profile} on:like={handleLike} on:view={handleView} />
   {/each}
  {:else}
   <div class="no-results">
    <p>No profiles found matching your criteria.</p>
    <p>Try adjusting your search parameters.</p>
   </div>
  {/if}
 </div>
</Content>
