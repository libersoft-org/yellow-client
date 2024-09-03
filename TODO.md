# Bugs

# Features

- Add a "new conversation" button (modal, that creates a new conversation)
- Add lazy loader to conversations list and messages (already in app.css: <div class="loader"></div>)
- Add mobile responsivity (show left panel only by default)
- Add number of new messages in conversations list
- Add the last message preview to conversations list
- Add multi-line messages
- On message sent, load message data from server (now it just throws error = 0, message = "Message sent"), server should throw data: { id, address_from, address_to, message, created } (from database)
- Auto reconnect in few seconds when connection is lost
- Account registration form
- File / image send
- Link previews (YouTube, OG etc.)
- Voice / video messages
- Animated stickers (lottie)
- Reply / forwarded message
