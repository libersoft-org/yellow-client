#!/bin/sh

screen -dmS yellow-client bash -c '
echo -ne "\033]0;YELLOW CLIENT\007"
#bun --bun run dev
npm run dev
'