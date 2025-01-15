#!/bin/sh

REPO="yellow-client.git"
NAME="LiberSoft"
BRANCH="main"
EMAIL="info@libersoft.org"
USER="libersoft-org"
PASS=`cat ./.secret_git`

if [ "$#" -eq 0 ]; then
 echo ""
 echo "------------------------"
 echo "Git commit & push script"
 echo "------------------------"
 echo ""
 echo "This script commits the changes and pushes them to GitHub."
 echo ""
 echo "Usage: $0 \"[SOME COMMENT]\""
 echo "Example: $0 \"Add README.md\""
 echo ""
 exit 1
fi

if [ ! -d "./.git/" ]; then
 git init
 git config --global --add safe.directory '*'
 git remote add origin https://$USER:$PASS@github.com/$USER/$REPO
else
 git remote set-url origin https://$USER:$PASS@github.com/$USER/$REPO
fi
bun i -g prettier prettier-plugin-svelte
prettier --config prettier-libersoft.json --plugin 'prettier-plugin-svelte' --write "src/**/*.{js,ts,css,html,svelte}"
git config user.name "$NAME"
git config user.email "$EMAIL"
git status
git add .
git status
git commit -m "$1"
#git branch -M $BRANCH
git push 
# -u origin $BRANCH
git status
