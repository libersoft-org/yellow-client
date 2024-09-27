#!/usr/bin/env fish

nvm use

prettier --config prettier-libersoft.json --write "src/**/*.{js,ts,css,html}"
