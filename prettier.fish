#!/usr/bin/env fish

nvm use

prettier --plugin prettier-plugin-svelte --write "src/**/*.{js,ts,css,html,svelte}"
