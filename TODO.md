# Bugs

- CORE: The server is automatically reconnected and logged in again after logout
- MESSAGES: Sometimes people receive 1 message multiple times (new_message event) - multiple websocket connections??
- MESSAGES: New message notification works only if Messages module is previously opened
- CORE: Logout should reset all module components' variables (core/components/menu.svelte - logout()) - consider doing it, because we'll get rid of login (use account switching instead)
- BUILD: When moving the build of the app to web server's subdirectory (for example to /client/), it does not support relative paths (it's loading JS files /_app/... instead of /client/_app/...)

# Features

- MESSAGES: messages.js - showNotification - switch between native and web notifications
- MESSAGES: Move items in conversations list on message sent / received instead of reloading from server + if it's a new conversation, add it to converastion list
- MESSAGES: Add lazy loader to conversations list and messages (already in app.css: <div class="loader"></div>)
- MESSAGES: Add the last message preview to conversations list
- MESSAGES: On message sent, load message data from server (now it just throws error = 0, message = "Message sent"), server should throw data: { id, address_from, address_to, message, created } (from database)
- MESSAGES: When starting a new conversation, load visible_name if available
- MESSAGES: Add number of new messages in conversations list
- MESSAGES: Seen function - when new message is visible on screen, send "seen" command to specific message
- MESSAGES: File / image send
- MESSAGES: Animated stickers (lottie)
- MESSAGES: GIFs
- MESSAGES: Link previews (YouTube, OG etc.)
- MESSAGES: Voice / video messages
- MESSAGES: Reply / forwarded message
- CONTACTS: Make whole module
- CORE: Session expired -> logout (consider to get rid of sessions completely)
- CORE: Instead of login / logout add account switching
- CORE: Add wizard (create keys, add accounts)
