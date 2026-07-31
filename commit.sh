#!/usr/bin/env bash

REPO="yellow-client.git"
NAME="LiberSoft"
BRANCH="main"
EMAIL="info@libersoft.org"
USER="libersoft-org"
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

cd "$ROOT"

PASS=$(<"$ROOT/.secret_git")

if [ ! -d "./.git/" ]; then
	git init
	git config --global --add safe.directory '*'
	git remote add origin https://$USER:$PASS@github.com/$USER/$REPO
else
	git remote set-url origin https://$USER:$PASS@github.com/$USER/$REPO
fi

bun i -g prettier

git config user.name "$NAME"
git config user.email "$EMAIL"

if ! "$ROOT/format.sh" --changed; then
	echo "commit.sh: formatting changed files failed - committing without a fresh format pass"
fi

git status
git add .

src/tools/check-source-hygiene.sh --added

git status

if [ "$#" -eq 0 ]; then
	echo "Generating commit message using Claude Code..."
	# echo "Generating commit message using GitHub Copilot..."
	COMMIT_MSG=$({
		echo "Write exactly one Git commit subject."
		echo "Max 250 characters."
		echo "One line only."
		echo "No prefix."
		echo "No markdown."
		echo "No bullets."
		echo "No explanation."
		echo "No status narration."
		echo "If there are no changes, write exactly: No changes"
		echo
		echo "GIT STATUS:"
		git status --short
		echo
		echo "STAGED DIFF STAT:"
		git diff --cached --stat
		echo
		echo "STAGED DIFF:"
		git diff --cached --unified=0
		echo
		echo "UNSTAGED DIFF STAT:"
		git diff --stat
		echo
		echo "UNSTAGED DIFF:"
		git diff --unified=0
	} | claude -p --model haiku --output-format text --no-session-persistence \
		--system-prompt "You output exactly one line of plain text and nothing else. Never use markdown, code fences, backticks, bullets, headings or commentary." \
		--disallowedTools Bash Read Glob Grep Edit Write WebFetch WebSearch Task TodoWrite 2>/dev/null |
		sed -e 's/`//g' -e '/^[[:space:]]*$/d' | head -n 1)
	# Previous generator (GitHub Copilot CLI), kept for reference:
	# } | copilot -s --no-ask-user 2>/dev/null)
	if [ -z "$COMMIT_MSG" ] || [ "$COMMIT_MSG" = "No changes" ]; then
		printf '\033[31mERROR:\033[0m Failed to generate commit message. Please provide one manually:\n'
		echo "Usage: $0 \"[COMMIT MESSAGE]\""
		exit 1
	fi
	COMMIT_MSG=$(echo "$COMMIT_MSG" | sed 's/"//g' | sed "s/'//g")
	printf '\033[33mGENERATED COMMIT MESSAGE:\033[0m %s\n' "$COMMIT_MSG"
	COMMIT_MESSAGE="$COMMIT_MSG"
else
	COMMIT_MESSAGE=$(echo "$1" | sed 's/"//g' | sed "s/'//g")
fi

git commit -m "$COMMIT_MESSAGE"
git push
git status
