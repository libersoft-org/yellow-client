# Bugs

- on message sent, load message data from server (now it just throws error = 0, message = "Message sent"), server should throw data: { id, address_from, address_to, message, created } (from database)

# Features

- Add a login page (server / user / password)
- Add a "new conversation" button
- Add lazy loader to older messages and conversations list
- Add mobile responsivity (show left panel only by default)
- Add the last message preview to conversations list
- Add number of new messages in conversations list
