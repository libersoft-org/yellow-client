<script>
 import Content from '../components/content.svelte';
 import Panel from '../components/panel.svelte';

 let settings = {
  notifications: {
   newMatches: true,
   newLikes: true,
   messages: true,
  },
  privacy: {
   showOnlineStatus: true,
   showLocation: true,
   showLastActive: true,
  },
  discovery: {
   distance: 50,
   ageRange: [18, 99],
   showMe: true,
  },
 };

 function saveSettings() {
  // In a real app, this would save to the server
  alert('Settings saved!');
 }
</script>

<style>
 .settings-container {
  max-width: 600px;
  margin: 0 auto;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  padding: 20px;
 }

 .settings-section {
  margin-bottom: 30px;
 }

 .section-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
 }

 .setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f5f5f5;
 }

 .setting-label {
  font-weight: bold;
 }

 .setting-description {
  font-size: 14px;
  color: #666;
  margin-top: 3px;
 }

 .toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
 }

 .toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
 }

 .slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
 }

 .slider:before {
  position: absolute;
  content: '';
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
 }

 input:checked + .slider {
  background-color: #4a90e2;
 }

 input:checked + .slider:before {
  transform: translateX(26px);
 }

 .range-control {
  width: 100%;
  margin-top: 10px;
 }

 .range-value {
  text-align: right;
  font-weight: bold;
  margin-top: 5px;
 }

 .save-button {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  margin-top: 20px;
 }
</style>

<Panel label="Settings" />
<Content>
 <div class="settings-container">
  <div class="settings-section">
   <h2 class="section-title">Notifications</h2>

   <div class="setting-item">
    <div>
     <div class="setting-label">New Matches</div>
     <div class="setting-description">Get notified when you have a new match</div>
    </div>
    <label class="toggle-switch">
     <input type="checkbox" bind:checked={settings.notifications.newMatches} />
     <span class="slider"></span>
    </label>
   </div>

   <div class="setting-item">
    <div>
     <div class="setting-label">New Likes</div>
     <div class="setting-description">Get notified when someone likes your profile</div>
    </div>
    <label class="toggle-switch">
     <input type="checkbox" bind:checked={settings.notifications.newLikes} />
     <span class="slider"></span>
    </label>
   </div>

   <div class="setting-item">
    <div>
     <div class="setting-label">Messages</div>
     <div class="setting-description">Get notified for new messages</div>
    </div>
    <label class="toggle-switch">
     <input type="checkbox" bind:checked={settings.notifications.messages} />
     <span class="slider"></span>
    </label>
   </div>
  </div>

  <div class="settings-section">
   <h2 class="section-title">Privacy</h2>

   <div class="setting-item">
    <div>
     <div class="setting-label">Show Online Status</div>
     <div class="setting-description">Let others see when you're online</div>
    </div>
    <label class="toggle-switch">
     <input type="checkbox" bind:checked={settings.privacy.showOnlineStatus} />
     <span class="slider"></span>
    </label>
   </div>

   <div class="setting-item">
    <div>
     <div class="setting-label">Show Location</div>
     <div class="setting-description">Show your approximate location to others</div>
    </div>
    <label class="toggle-switch">
     <input type="checkbox" bind:checked={settings.privacy.showLocation} />
     <span class="slider"></span>
    </label>
   </div>

   <div class="setting-item">
    <div>
     <div class="setting-label">Show Last Active</div>
     <div class="setting-description">Show when you were last active</div>
    </div>
    <label class="toggle-switch">
     <input type="checkbox" bind:checked={settings.privacy.showLastActive} />
     <span class="slider"></span>
    </label>
   </div>
  </div>

  <div class="settings-section">
   <h2 class="section-title">Discovery</h2>

   <div class="setting-item">
    <div>
     <div class="setting-label">Maximum Distance</div>
     <div class="setting-description">Show people within this distance</div>
     <input type="range" min="1" max="100" class="range-control" bind:value={settings.discovery.distance} />
     <div class="range-value">{settings.discovery.distance} km</div>
    </div>
   </div>

   <div class="setting-item">
    <div>
     <div class="setting-label">Show Me</div>
     <div class="setting-description">Allow your profile to be discoverable</div>
    </div>
    <label class="toggle-switch">
     <input type="checkbox" bind:checked={settings.discovery.showMe} />
     <span class="slider"></span>
    </label>
   </div>
  </div>

  <button class="save-button" on:click={saveSettings}>Save Settings</button>
 </div>
</Content>
