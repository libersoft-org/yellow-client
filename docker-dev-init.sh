#!/bin/sh
set -e
echo "init"
~/.bun/bin/bun i --frozen-lockfile

echo "HOLLOW: $HOLLOW"

if [ "$HOLLOW" = "true" ]; then
 echo "link yellow-client-common for development"
 rm -rf ./node_modules/yellow-client-common || true
 ln -s ../../yellow-client-common ./node_modules/
fi
