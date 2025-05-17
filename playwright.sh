#!/bin/fish

function e; or status --is-interactive; or exit 1; end

nvm use;

npx playwright test --reporter=line
