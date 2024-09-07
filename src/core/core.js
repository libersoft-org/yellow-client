import Socket from './socket.js';
import Auth from './auth.js';

export function login(credentials) {
 Socket.events.addEventListener('open', event => {
  console.log('LL Connected to WebSocket:', event);
 });
 Socket.events.addEventListener('error', event => {
  //errorMessage = event.detail.error.message;
  console.error('LL WebSocket Error:', event);
 });
 Socket.events.addEventListener('close', event => {
  console.log('LL WebSocket Closed, Code:', event);
 });
 Socket.connect(credentials.server);
 /*
 if (await Socket.connect(credentials.server, () => {
  if (Auth.userAddress) alert('Lost connection with server');
 })) {
  isLoggingIn = true;
  Socket.send('user_login', { address: credentials.address, password: credentials.password }, false, (req, res) => {
   isLoggingIn = false;
   if (res.error !== 0) {
    loginError = res;
   } else {
    loginError = null;
    Auth.userAddress = credentials.address;
    Auth.sessionID = res.data.sessionID;
    if (credentials.stayLoggedIn) {
     //TODO: delete credentials.stayLoggedIn;
     localStorage.setItem('login', JSON.stringify(credentials));
    }
   }
  });
 }
  */
}

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
 login,
 logout
};
