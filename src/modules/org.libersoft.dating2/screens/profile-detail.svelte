<script>
 import { onMount } from 'svelte';
 import Content from '../components/content.svelte';
 import Panel from '../components/panel.svelte';
 import { selectedProfile, page, likeProfile } from '../dating.js';

 let account;

 onMount(() => {
  // Get the account from the parent component
  account = window.yellowAccount;
 });

 function goBack() {
  page.set('people');
 }

 function handleLike() {
  if (account && $selectedProfile && $selectedProfile.id) {
   likeProfile(account, $selectedProfile.id);
  }
 }

 // Calculate age from birthdate
 function calculateAge(birthdate) {
  if (!birthdate) return '';

  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
   age--;
  }

  return age;
 }

 $: age = $selectedProfile ? calculateAge($selectedProfile.birthdate) : '';
</script>

<style>
 .profile-detail {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
 }

 .profile-photos {
  position: relative;
  height: 400px;
  background-color: #eee;
 }

 .profile-photos img {
  width: 100%;
  height: 100%;
  object-fit: cover;
 }

 .back-button {
  position: absolute;
  top: 15px;
  left: 15px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
 }

 .profile-info {
  padding: 20px;
 }

 .profile-name-age {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
 }

 .profile-location {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
 }

 .profile-section {
  margin-bottom: 20px;
 }

 .section-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #4a90e2;
 }

 .profile-bio {
  line-height: 1.6;
  color: #333;
 }

 .profile-interests {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
 }

 .interest-tag {
  background-color: #f0f0f0;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
 }

 .profile-actions {
  display: flex;
  justify-content: center;
  padding: 20px;
  border-top: 1px solid #eee;
 }

 .action-button {
  padding: 12px 30px;
  border-radius: 30px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  margin: 0 10px;
 }

 .like-button {
  background-color: #ff6b6b;
  color: white;
  border: none;
 }

 .message-button {
  background-color: #4a90e2;
  color: white;
  border: none;
 }
</style>

<Panel label="Profile" />
<Content>
 {#if $selectedProfile}
  <div class="profile-detail">
   <div class="profile-photos">
    <button class="back-button" on:click={goBack}>←</button>
    {#if $selectedProfile.photos && $selectedProfile.photos.length > 0}
     <img src={$selectedProfile.photos[0]} alt={$selectedProfile.displayName} />
    {:else}
     <img src="modules/org.libersoft.dating2/img/default-profile.svg" alt="Default profile" />
    {/if}
   </div>

   <div class="profile-info">
    <h1 class="profile-name-age">
     {$selectedProfile.displayName}{age ? `, ${age}` : ''}
    </h1>

    {#if $selectedProfile.location}
     <div class="profile-location">{$selectedProfile.location}</div>
    {/if}

    {#if $selectedProfile.bio}
     <div class="profile-section">
      <h2 class="section-title">About</h2>
      <div class="profile-bio">{$selectedProfile.bio}</div>
     </div>
    {/if}

    {#if $selectedProfile.interests && $selectedProfile.interests.length > 0}
     <div class="profile-section">
      <h2 class="section-title">Interests</h2>
      <div class="profile-interests">
       {#each $selectedProfile.interests as interest}
        <div class="interest-tag">{interest}</div>
       {/each}
      </div>
     </div>
    {/if}

    <div class="profile-section">
     <h2 class="section-title">Details</h2>
     <div>
      <strong>Gender:</strong>
      {$selectedProfile.gender || 'Not specified'}
     </div>
     {#if $selectedProfile.lookingFor}
      <div>
       <strong>Looking for:</strong>
       {$selectedProfile.lookingFor}
      </div>
     {/if}
    </div>
   </div>

   <div class="profile-actions">
    <button class="action-button like-button" on:click={handleLike}> Like </button>
   </div>
  </div>
 {:else}
  <div style="text-align: center; padding: 30px;">No profile selected</div>
 {/if}
</Content>
