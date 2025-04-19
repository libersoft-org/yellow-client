#!/bin/sh

[ -d "./build/" ] && rm -r build
bun i --frozen-lockfile
bun --bun run build
