#!/bin/sh

[ -d "./build/" ] && rm -r build
bun --bun run build
