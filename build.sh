#!/bin/sh

CLIENT_PATH_BASE="$1"

[ -d "./build/" ] && rm -r build
bun i --frozen-lockfile
CLIENT_PATH_BASE=$CLIENT_PATH_BASE bun --bun run build
