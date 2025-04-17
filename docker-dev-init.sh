#!/bin/sh
set -e
echo "init"
~/.bun/bin/bun i --frozen-lockfile

rm -rf ./node_modules/yellow-server-common || true
ln -s /app/lib/yellow-server-common ./node_modules/

