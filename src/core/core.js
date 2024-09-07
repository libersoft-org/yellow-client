export let userAddress = null;
export let sessionID = null;

export function logout() {
 if (Socket.disconnect()) {
  Auth.userAddress = null;
  Auth.sessionID = null;
  //TODO: set this in Messages module
  //selectedConversation = null;
  //messagesArray = [];
  isMenuOpen = false;
  isLoggingIn = false;
  localStorage.removeItem('login');
 }
}

export default {
 userAddress,
 sessionID,
 logout
};
