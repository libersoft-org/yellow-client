#!/usr/bin/env fish

nvm use

prettier --config prettier-libersoft.json --plugin 'prettier-plugin-svelte' --write "src/**/*.{js,ts,css,html,svelte}"
date
while ./is_prettier_running.fish begin; echo ..;  end;
date
sleep 15;
date


