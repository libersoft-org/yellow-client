#!/usr/bin/env fish

nvm use

prettier --config prettier-libersoft.json --plugin 'prettier-plugin-svelte' --write "src/**/*.{js,ts,css,html,svelte}"
while ./is_prettier_running.fish begin; date;  end;


