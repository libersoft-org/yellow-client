#!/usr/bin/env fish

nvm use

prettier --config-path prettier-libersoft.json --plugin prettier-plugin-svelte --write "src/**/*.{js,ts,css,html,svelte}"

