# Bugs

- Fix messages
- Logout should reset all module components' variables (core/components/menu.svelte - logout())
- When moving the build of the app to web server's subdirectory (for example to /client/), it does not support relative paths (it's loading JS files /_app/... instead of /client/_app/...)

# Features

- If server is connected, hide green (info) status after 5 seconds + add close button to status window
- Hide server status after some time
- Move whole non-login component from +page.svelte to separate component
- Add mobile responsivity (show left panel only by default)
- Add lazy loader to conversations list and messages (already in app.css: <div class="loader"></div>)
- Add the last message preview to conversations list
- On message sent, load message data from server (now it just throws error = 0, message = "Message sent"), server should throw data: { id, address_from, address_to, message, created } (from database)
- When starting a new conversation, load visible_name if available
- Add number of new messages in conversations list
- Session expired -> logout (consider to get rid of sessions completely)
- File / image send
- Animated stickers (lottie)
- GIFs
- Link previews (YouTube, OG etc.)
- Voice / video messages
- Reply / forwarded message

# Questions

- How to nicely reload conversations list when message is sent (without loading the whole conversation list from server)?
