#!/usr/bin/env sh

prettier --config prettier-libersoft.json --plugin 'prettier-plugin-svelte' --write "src/**/*.{js,ts,css,html,svelte}"
