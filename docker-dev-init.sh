#!/bin/sh
set -e
echo "init"
~/.bun/bin/bun i --frozen-lockfile

echo "HOLLOW: $HOLLOW"

if [ "$HOLLOW" = "true" ]; then
 echo "link yellow-server-common for development"
 rm -rf ./node_modules/yellow-server-common || true
 ln -s ../../yellow-server-common ./node_modules/
fi
