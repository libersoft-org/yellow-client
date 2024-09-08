# Bugs

- Fix messages
- When a conversation with large messages is opened, sidebar shrinks - can be fixed by switching "width" to "min-width" (mind resizer!!!)
- conversation.svelte - fix events for isClientFocused (for notifications) - move somewhere else?
- Logout should reset all module components' variables (core/components/menu.svelte - logout())
- When moving the build of the app to web server's subdirectory (for example to /client/), it does not support relative paths (it's loading JS files /_app/... instead of /client/_app/...)

# Features

- add a close button to status notification
- If server is connected, hide green (info) status notification after 5 seconds
- Move server status notification somewhere else
- Move whole non-login component from +page.svelte to separate component
- Move items in conversations list on message sent / received instead of reloading from server
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
