# Bugs

- MESSAGES: When new contact sends me a new message, it doesn't show visible name in conversations list
- MESSAGES: Scrolling down on new message sometimes doesn't work
- CORE: The server is automatically reconnected and logged in again after logout
- MESSAGES: Sometimes people receive 1 message multiple times (new_message event) - multiple websocket connections??
- MESSAGES: New message notification works only if Messages module is previously opened
- MESSAGES: On click somewhere in messages, refocus message bar
- CORE: Logout should reset all module components' variables (core/components/menu.svelte - logout()) - consider doing it, because we'll get rid of login (use account switching instead)
- BUILD: When moving the build of the app to web server's subdirectory (for example to /client/), it does not support relative paths (it's loading JS files /_app/... instead of /client/_app/...)

# Features

- MESSAGES: Add lazy loader messages (already in app.css: <div class="loader"></div>)
- CORE: Instead of login / logout add account switching
- CORE: Add wizard (create keys, add accounts)
- CORE: Session expired -> login again
- MESSAGES: When starting a new conversation, load visible_name if available
- MESSAGES: On message sent, load message data from server (now it just throws error = 0, message = "Message sent"), server should throw data: { id, address_from, address_to, message, seen, created } (from database)
- MESSAGES: File / image send
- MESSAGES: Animated stickers (lottie)
- MESSAGES: GIFs
- MESSAGES: Link previews (YouTube, OG etc.)
- MESSAGES: Voice / video messages
- MESSAGES: Reply / forwarded message
- MESSAGES: Delete message
- CONTACTS: Make whole module
- MESSAGES: Add messages concepts (keep unsent messages for each conversation)
- MESSAGES: messages.js - showNotification - switch between native and web notifications

# Testing

- Try to send a long conversation list (1 000 000 messages) and meanwhile send a new message notification and see if new message is not lost
