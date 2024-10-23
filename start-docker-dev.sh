#!/bin/sh

[ ! -d "./node_modules/" ] && ./docker-dev-init.sh

npm run dev