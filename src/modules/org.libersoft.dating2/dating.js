import { writable, get } from 'svelte/store';
import { send } from '../../core/core.js';

export const identifier = 'org.libersoft.dating2';

// Stores
export const page = writable('people');
export const profile = writable(null);
export const searchResults = writable([]);
export const matches = writable([]);
export const likes = writable({ received: [], sent: [] });
export const selectedProfile = writable(null);
export const online = writable(false);

// Initialize module data
export function initData(acc) {
 let result = {
  online: writable(false),
  profile: writable(null),
  searchResults: writable([]),
  matches: writable([]),
  likes: writable({ received: [], sent: [] }),
  selectedProfile: writable(null),
  page: writable('people'),
 };

 // Link the local stores to the account module data
 profile.subscribe(value => {
  if (acc.module_data[identifier]) {
   acc.module_data[identifier].profile.set(value);
  }
 });

 online.subscribe(value => {
  if (acc.module_data[identifier]) {
   acc.module_data[identifier].online.set(value);
  }
 });

 return result;
}

// Initialize communications
export function initComms(acc) {
 console.log('Dating module: initializing communications');

 // Subscribe to events
 moduleEventSubscribe(acc, 'profile_update');
 moduleEventSubscribe(acc, 'match_notification');
 moduleEventSubscribe(acc, 'like_notification');

 // Get initial profile data
 getProfile(acc);

 // Set online status
 online.set(true);
}

// Deinitialize communications
export function deinitComms(acc) {
 console.log('Dating module: deinitializing communications');

 // Unsubscribe from events
 sendData(acc, null, 'unsubscribe', { event: 'profile_update' });
 sendData(acc, null, 'unsubscribe', { event: 'match_notification' });
 sendData(acc, null, 'unsubscribe', { event: 'like_notification' });

 // Set offline status
 online.set(false);
}

// Helper function to send data to the server
function sendData(acc, account, command, params = {}, sendSessionID = true, callback = null, quiet = false) {
 return send(acc, account, identifier, command, params, sendSessionID, callback, quiet);
}

// Subscribe to module events
function moduleEventSubscribe(acc, event_name) {
 sendData(acc, null, 'subscribe', { event: event_name }, true, (req, res) => {
  if (res.error !== false) {
   console.error('Error while subscribing to event:', res.message);
  }
 });
}

// Profile operations
export function getProfile(acc) {
 sendData(acc, null, 'profile_get', {}, true, (req, res) => {
  if (res.error === false && res.data && res.data.profile) {
   profile.set(res.data.profile);
  } else {
   console.error('Error getting profile:', res.message);
  }
 });
}

export function updateProfile(acc, profileData) {
 sendData(acc, null, 'profile_update', { profile: profileData }, true, (req, res) => {
  if (res.error === false && res.data && res.data.profile) {
   profile.set(res.data.profile);
  } else {
   console.error('Error updating profile:', res.message);
  }
 });
}

// Search operations
export function searchProfiles(acc, searchParams) {
 sendData(acc, null, 'profile_search', { searchParams }, true, (req, res) => {
  if (res.error === false && res.data && res.data.profiles) {
   searchResults.set(res.data.profiles);
  } else {
   console.error('Error searching profiles:', res.message);
  }
 });
}

// Like operations
export function likeProfile(acc, targetUserId) {
 sendData(acc, null, 'like_profile', { targetUserId }, true, (req, res) => {
  if (res.error === false) {
   // Update the likes sent list
   likes.update(current => {
    const newSent = [...current.sent, { userId: targetUserId, timestamp: new Date().toISOString() }];
    return { ...current, sent: newSent };
   });

   // If it's a match, update matches
   if (res.data && res.data.isMatch) {
    getMatches(acc);
   }
  } else {
   console.error('Error liking profile:', res.message);
  }
 });
}

export function getLikes(acc) {
 sendData(acc, null, 'get_likes', {}, true, (req, res) => {
  if (res.error === false && res.data && res.data.likes) {
   likes.set(res.data.likes);
  } else {
   console.error('Error getting likes:', res.message);
  }
 });
}

export function getMatches(acc) {
 sendData(acc, null, 'get_matches', {}, true, (req, res) => {
  if (res.error === false && res.data && res.data.matches) {
   matches.set(res.data.matches);
  } else {
   console.error('Error getting matches:', res.message);
  }
 });
}

// Event handlers
export function handleProfileUpdate(data) {
 profile.set(data.profile);
}

export function handleMatchNotification(data) {
 // Update matches list
 matches.update(current => [...current, data.match]);
}

export function handleLikeNotification(data) {
 // Update likes received list
 likes.update(current => {
  const newReceived = [...current.received, data.like];
  return { ...current, received: newReceived };
 });
}

// Select a profile to view details
export function selectProfile(profileData) {
 selectedProfile.set(profileData);
 page.set('profile');
}
