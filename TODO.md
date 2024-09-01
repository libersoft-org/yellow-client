# Bugs

- New messages are not arriving (test in 2 browsers)
- When waiting few seconds on login screen, it throws a websocket error for some reason

# Features

- Add notifications
- Add new message sound
- Links in text
- Possibility to save login credentials (autologin on page refresh)
- Add a "new conversation" button (modal, that creates a new conversation)
- Add lazy loader to older messages and conversations list
- Add mobile responsivity (show left panel only by default)
- Add number of new messages in conversations list
- Add the last message preview to conversations list
- On message sent, load message data from server (now it just throws error = 0, message = "Message sent"), server should throw data: { id, address_from, address_to, message, created } (from database)
- Add menu with Logout button
- Account registration form
- File / image send
- Link previews (YouTube, OG etc.)
- Voice / video messages
- Animated stickers (lottie)
- Reply / forwarded message
