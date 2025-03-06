<script>
 import { createEventDispatcher } from 'svelte';
 import BaseButton from '../../../core/components/base-button.svelte';

 export let profile;

 const dispatch = createEventDispatcher();

 function viewProfile() {
  dispatch('view', profile);
 }

 function likeProfile() {
  dispatch('like', profile);
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

 $: age = calculateAge(profile.birthdate);
</script>

<style>
 .profile-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 300px;
  margin: 0 auto 20px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  background-color: white;
 }

 .profile-image {
  width: 100%;
  height: 300px;
  background-color: #eee;
  position: relative;
 }

 .profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
 }

 .profile-info {
  padding: 15px;
 }

 .profile-name {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 5px 0;
 }

 .profile-age-location {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
 }

 .profile-bio {
  font-size: 14px;
  margin-bottom: 15px;
  color: #333;
 }

 .profile-actions {
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
  flex: 1;
  margin: 0 5px;
 }

 .view-button {
  background-color: #f0f0f0;
  color: #333;
 }

 .like-button {
  background-color: #ff6b6b;
  color: white;
 }
</style>

<div class="profile-card">
 <div class="profile-image">
  {#if profile.photos && profile.photos.length > 0}
   <img src={profile.photos[0]} alt={profile.displayName} />
  {:else}
   <img src="modules/org.libersoft.dating2/img/default-profile.svg" alt="Default profile" />
  {/if}
 </div>

 <div class="profile-info">
  <h3 class="profile-name">{profile.displayName}</h3>
  <div class="profile-age-location">
   {age ? `${age} years` : ''}
   {profile.location ? `• ${profile.location}` : ''}
  </div>
  {#if profile.bio}
   <div class="profile-bio">{profile.bio}</div>
  {/if}
 </div>

 <div class="profile-actions">
  <BaseButton onClick={viewProfile}>
   <div class="action-button view-button">View Profile</div>
  </BaseButton>
  <BaseButton onClick={likeProfile}>
   <div class="action-button like-button">Like</div>
  </BaseButton>
 </div>
</div>
