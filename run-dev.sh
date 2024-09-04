#!/bin/sh

[ -d "./build/" ] && rm -r build
#bun --bun run dev -- --host
npm run dev -- --host
