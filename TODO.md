# Bugs

- Fix conversation list SQL on server

# Features

- In +page.svelte check which response match with which sent command (so we don't need to use the big socket.onmessage function)
- Subscribe to "new_message" event after start and add a new message to chat + reload conversations in left panel when event comes
- Add the last message preview to conversation list
- Add a "new conversation" button
- Add a login page (server / user / password)
