# Bugs

- MESSAGES: Linkify of plain text message does not work
- MESSAGES: When a new conversation is created to nonsensical address and then send a message to such address, the client start sending messages in infinite loop
- MESSAGES: New message notification works only if Messages module is previously opened
- MESSAGES: Sometimes people receive 1 message multiple times (new_message event) - multiple websocket connections??
- MESSAGES: On click somewhere in messages, refocus message bar
- CORE: Logout should reset all module components' variables (core/components/menu.svelte - logout()) - consider doing it, because we'll get rid of login (use account switching instead)
- BUILD: When moving the build of the app to web server's subdirectory (for example to /client/), it does not support relative paths (it's loading JS files /_app/... instead of /client/_app/...)
- CORE: fix accounts dropdown keydown (event propagates to clickToggleAccounts and re-opens dropdown)
- MESSAGES: GET javascript:alert('XSS') net::ERR_UNKNOWN_URL_SCHEME
- MESSAGES: GET http://localhost:3000/x 404 (Not Found)
- MESSAGES: Scrolling down on new message sometimes doesn't work

# Features

- WALLET: network and wallet lists should contain search (filter) box
- WALLET: network selection - show symbols in list and change crypto symbol when selected
- WALLET: create wallet - add QR code + save button + print
- WALLET: add "My wallets" section and move "Create wallet" into it + remove wallets
- WALLET: save wallets with private keys to localStorage
- WALLET: convert crypto to fiat
- WALLET: send, receive, token balances, history, settings, wizard for new wallet with seed phrase
- WALLET: when wrong RPC selected (e.g. Ethereum - Goerli Testnet) - it loops the error in console, rather try the next RPC in row and if it won't work, just throw an error and don't connect
- WALLET: HW wallet (Trezor, Ledger) connection
- CORE: Add protocol selection to Core.accounts_config (AMTP, DMTP (not yet implemented), SMTP (not yet implemented))
- MESSAGES: When a user gets a lot of new messages, it should scroll to the oldest unread one + add an element bar with text "Unread messages"
- MESSAGES: When scrolling up, add a "scroll to end" button with caret down in bottom right corner
- MESSAGES: Add a red dot in top right corner of module icon (indicator of a new activity)
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
