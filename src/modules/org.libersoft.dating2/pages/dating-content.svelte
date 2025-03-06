<script>
 import { page } from '../dating.js';
 import People from '../screens/people.svelte';
 import Matches from '../screens/matches.svelte';
 import Likes from '../screens/likes.svelte';
 import MyProfile from '../screens/my-profile.svelte';
 import Settings from '../screens/settings.svelte';
 import ProfileDetail from '../screens/profile-detail.svelte';

 const pages = {
  people: People,
  matches: Matches,
  likes: Likes,
  myprofile: MyProfile,
  settings: Settings,
  profile: ProfileDetail,
 };
</script>

<style>
 .dating-content {
  height: 100vh;
  max-height: 100vh;
  background: url('/img/background.webp') repeat;
  background-size: 400px;
 }
</style>

<div class="dating-content">
 <svelte:component this={pages[$page]} />
</div>
