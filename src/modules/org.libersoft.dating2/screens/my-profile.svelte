<script>
 import { onMount } from 'svelte';
 import Content from '../components/content.svelte';
 import Panel from '../components/panel.svelte';
 import { getProfile, updateProfile } from '../dating.js';
 import { profile } from '../dating.js';

 let account;
 let editMode = false;
 let editedProfile = {};
 let interestsString = '';

 onMount(() => {
  // Get the account from the parent component
  account = window.yellowAccount;
  if (account) {
   getProfile(account);
  }
 });

 function startEditing() {
  editedProfile = { ...$profile };
  interestsString = editedProfile.interests ? editedProfile.interests.join(', ') : '';
  editMode = true;
 }

 function cancelEditing() {
  editMode = false;
 }

 function saveProfile() {
  if (account) {
   // Convert the comma-separated string back to an array
   if (interestsString.trim()) {
    editedProfile.interests = interestsString.split(',').map(item => item.trim());
   } else {
    editedProfile.interests = [];
   }

   updateProfile(account, editedProfile);
   editMode = false;
  }
 }
</script>

<style>
 .profile-container {
  max-width: 600px;
  margin: 0 auto;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
 }

 .profile-header {
  position: relative;
  height: 200px;
  background-color: #4a90e2;
 }

 .profile-avatar {
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid white;
  background-color: #eee;
  overflow: hidden;
 }

 .profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
 }

 .profile-content {
  padding: 60px 20px 20px;
 }

 .profile-name {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
 }

 .profile-details {
  margin-top: 20px;
 }

 .detail-item {
  margin-bottom: 15px;
 }

 .detail-label {
  font-weight: bold;
  margin-bottom: 5px;
 }

 .detail-value {
  color: #333;
 }

 .profile-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
 }

 .action-button {
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  margin: 0 10px;
 }

 .edit-button {
  background-color: #4a90e2;
  color: white;
 }

 .cancel-button {
  background-color: #f0f0f0;
  color: #333;
 }

 .save-button {
  background-color: #4caf50;
  color: white;
 }

 /* Form styles */
 .edit-form {
  margin-top: 20px;
 }

 .form-group {
  margin-bottom: 15px;
 }

 label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
 }

 input,
 textarea,
 select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
 }

 textarea {
  min-height: 100px;
  resize: vertical;
 }
</style>

<Panel label="My Profile" />
<Content>
 {#if $profile}
  <div class="profile-container">
   <div class="profile-header">
    <div class="profile-avatar">
     {#if $profile.photos && $profile.photos.length > 0}
      <img src={$profile.photos[0]} alt={$profile.displayName} />
     {:else}
      <img src="modules/org.libersoft.dating2/img/default-profile.svg" alt="Default profile" />
     {/if}
    </div>
   </div>

   <div class="profile-content">
    <h1 class="profile-name">{$profile.displayName}</h1>

    {#if !editMode}
     <div class="profile-details">
      <div class="detail-item">
       <div class="detail-label">Bio</div>
       <div class="detail-value">{$profile.bio || 'No bio provided'}</div>
      </div>

      <div class="detail-item">
       <div class="detail-label">Gender</div>
       <div class="detail-value">{$profile.gender || 'Not specified'}</div>
      </div>

      <div class="detail-item">
       <div class="detail-label">Looking For</div>
       <div class="detail-value">{$profile.lookingFor || 'Not specified'}</div>
      </div>

      <div class="detail-item">
       <div class="detail-label">Location</div>
       <div class="detail-value">{$profile.location || 'Not specified'}</div>
      </div>

      <div class="detail-item">
       <div class="detail-label">Birthdate</div>
       <div class="detail-value">
        {$profile.birthdate ? new Date($profile.birthdate).toLocaleDateString() : 'Not specified'}
       </div>
      </div>

      {#if $profile.interests && $profile.interests.length > 0}
       <div class="detail-item">
        <div class="detail-label">Interests</div>
        <div class="detail-value">{$profile.interests.join(', ')}</div>
       </div>
      {/if}
     </div>

     <div class="profile-actions">
      <button class="action-button edit-button" on:click={startEditing}> Edit Profile </button>
     </div>
    {:else}
     <div class="edit-form">
      <div class="form-group">
       <label for="displayName">Display Name</label>
       <input type="text" id="displayName" bind:value={editedProfile.displayName} />
      </div>

      <div class="form-group">
       <label for="bio">Bio</label>
       <textarea id="bio" bind:value={editedProfile.bio}></textarea>
      </div>

      <div class="form-group">
       <label for="gender">Gender</label>
       <select id="gender" bind:value={editedProfile.gender}>
        <option value="">Select gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
       </select>
      </div>

      <div class="form-group">
       <label for="lookingFor">Looking For</label>
       <select id="lookingFor" bind:value={editedProfile.lookingFor}>
        <option value="">Select preference</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="any">Any</option>
       </select>
      </div>

      <div class="form-group">
       <label for="location">Location</label>
       <input type="text" id="location" bind:value={editedProfile.location} />
      </div>

      <div class="form-group">
       <label for="birthdate">Birthdate</label>
       <input type="date" id="birthdate" bind:value={editedProfile.birthdate} />
      </div>

      <div class="form-group">
       <label for="interests">Interests (comma separated)</label>
       <input type="text" id="interests" bind:value={interestsString} />
      </div>
     </div>

     <div class="profile-actions">
      <button class="action-button cancel-button" on:click={cancelEditing}> Cancel </button>
      <button class="action-button save-button" on:click={saveProfile}> Save Profile </button>
     </div>
    {/if}
   </div>
  </div>
 {:else}
  <div style="text-align: center; padding: 30px;">Loading profile...</div>
 {/if}
</Content>
