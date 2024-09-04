# Bugs

- When long text is overflowing in messages, then images in conversation list (left panel) are shrinked
- When moving the build of the app to web server's subdirectory (for example to /client/), it does not support relative paths (it's loading JS files /_app/... instead of /client/_app/...)
- Build replaces CSS background image path (for example from: "img/background.png" to "/_app/immutable/assets/img/background.png") - https://stackoverflow.com/questions/75843825/sveltekit-dev-build-and-path-problems-with-static-assets-referenced-in-css

# Features

- Close menu on clicking outside of it
- Add lazy loader to conversations list and messages (already in app.css: <div class="loader"></div>)
- Add mobile responsivity (show left panel only by default)
- Add number of new messages in conversations list
- Add the last message preview to conversations list
- Add multi-line messages
- On message sent, load message data from server (now it just throws error = 0, message = "Message sent"), server should throw data: { id, address_from, address_to, message, created } (from database)
- Auto reconnect in few seconds when connection is lost
- When starting a new conversation, load visible_name if available
- File / image send
- Animated stickers (lottie)
- GIFs
- Link previews (YouTube, OG etc.)
- Voice / video messages
- Reply / forwarded message
