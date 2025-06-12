#!/bin/sh
echo "0" $0 "1" $1
VITE_CLIENT_PATH_BASE="$1"
echo VITE_CLIENT_PATH_BASE= $VITE_CLIENT_PATH_BASE
[ -d "./build/" ] && rm -r build
bun i --frozen-lockfile
VITE_CLIENT_PATH_BASE=$VITE_CLIENT_PATH_BASE bun --bun run build
