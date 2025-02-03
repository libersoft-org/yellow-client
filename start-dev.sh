#!/bin/sh

echo -ne "\033]0;YELLOW CLIENT\007"
bun i --frozen-lockfile
#bun --bun run dev
npm run dev
