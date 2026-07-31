#!/usr/bin/env bash
# List every commit with its subject and line changes, then print total changes.
set -euo pipefail

NUMBER_WIDTH=5
MESSAGE_WIDTH=50
COUNT_WIDTH=8

usage() {
	echo "usage: git-commits.sh [commit-count]" >&2
	exit 2
}

if (($# > 1)); then
	usage
fi

commit_count="${1:-}"
if [[ -n "$commit_count" && ! "$commit_count" =~ ^[1-9][0-9]*$ ]]; then
	echo "git-commits: commit-count must be a positive integer" >&2
	usage
fi

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || {
	echo "git-commits: not inside a Git repository" >&2
	exit 1
}
cd "$repo_root"

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
	echo "git-commits: repository has no commits" >&2
	exit 1
fi

if [[ -t 1 ]]; then
	RED=$'\033[31m'
	GREEN=$'\033[32m'
	NET_PLUS=$'\033[93m'
	NET_MINUS=$'\033[38;5;130m'
	RESET=$'\033[0m'
else
	RED=""
	GREEN=""
	NET_PLUS=""
	NET_MINUS=""
	RESET=""
fi

separator() {
	printf '%*s' "$1" '' | tr ' ' '-'
}

log_args=(--reverse)
number_offset=0
if [[ -n "$commit_count" ]]; then
	log_args+=(--max-count="$commit_count")
	# A count selects the newest commits, so the first row listed is not the first commit.
	# Number rows by their real position in the whole history rather than within the window.
	total_commits="$(git rev-list --count HEAD)"
	if ((commit_count < total_commits)); then
		number_offset=$((total_commits - commit_count))
	fi
fi

printf '%*s %-7s %-*s %*s %*s %*s\n' "$NUMBER_WIDTH" "#" "Commit" "$MESSAGE_WIDTH" "Message" \
	"$COUNT_WIDTH" "Removed" "$COUNT_WIDTH" "Added" "$COUNT_WIDTH" "Net"
printf '%s %-7s %-*s %s %s %s\n' "$(separator "$NUMBER_WIDTH")" "-------" \
	"$MESSAGE_WIDTH" "$(separator "$MESSAGE_WIDTH")" \
	"$(separator "$COUNT_WIDTH")" "$(separator "$COUNT_WIDTH")" "$(separator "$COUNT_WIDTH")"

# One traversal carries identity, subject and diff totals together. Asking git per commit
# costs four processes each, and columns sized from the widest row cannot print until the
# whole walk ends; fixed widths let every row leave as soon as it is read.
git log "${log_args[@]}" --numstat --format=$'\x01%h\x02%s' HEAD |
	awk -v number_width="$NUMBER_WIDTH" -v number_offset="$number_offset" \
		-v message_width="$MESSAGE_WIDTH" -v count_width="$COUNT_WIDTH" \
		-v red="$RED" -v green="$GREEN" -v net_plus="$NET_PLUS" \
		-v net_minus="$NET_MINUS" -v reset="$RESET" '
		function emit(net, subject, net_colour) {
			if (!pending) return
			listed += 1
			total_added += added
			total_removed += removed
			net = added - removed
			subject = message
			if (length(subject) > message_width) {
				subject = substr(subject, 1, message_width - 3) "..."
			}
			net_colour = net < 0 ? net_minus : net_plus
			printf "%*d %-7s %-*s %s%*s%s %s%*s%s %s%*s%s\n", \
				number_width, number_offset + listed, hash, message_width, subject, \
				red, count_width, "-" removed, reset, \
				green, count_width, "+" added, reset, \
				net_colour, count_width, sprintf("%+d", net), reset
			pending = 0
		}
		substr($0, 1, 1) == "\001" {
			emit()
			record = substr($0, 2)
			split(record, field, "\002")
			hash = field[1]
			message = substr(record, length(field[1]) + 2)
			added = 0
			removed = 0
			pending = 1
			next
		}
		# Binary files report "-" for both counts and contribute no line total.
		$1 ~ /^[0-9]+$/ && $2 ~ /^[0-9]+$/ {
			added += $1
			removed += $2
		}
		END {
			emit()
			total_net = total_added - total_removed
			printf "\nSummary (%d commits)\n", listed
			printf "Removed: %s%*s%s\n", red, count_width, "-" total_removed, reset
			printf "Added:   %s%*s%s\n", green, count_width, "+" total_added, reset
			printf "Net:     %s%*s%s\n", total_net < 0 ? net_minus : net_plus, \
				count_width, sprintf("%+d", total_net), reset
		}
	'
