#!/bin/bash

# Git bisect script to find when 'bun run test:unit' started failing
# Usage: git bisect start <bad-commit> <good-commit>
#        git bisect run ./bisect-test.sh

# Install dependencies first (in case they changed between commits)
echo "Installing dependencies..."
bun install --frozen-lockfile || bun install
bun run init

# Run the unit tests
echo "Running unit tests..."
bun run test:unit

# Capture the exit code
exit_code=$?

# Exit with the test result
# 0 = tests passed (good commit)
# 1-127 = tests failed (bad commit)
# 125 = skip this commit (can't test)
if [ $exit_code -eq 0 ]; then
    echo "Tests passed - marking as good"
    exit 0
elif [ $exit_code -ge 128 ]; then
    # Exit codes >= 128 typically indicate killed by signal
    # Mark as untestable
    echo "Tests killed by signal - skipping this commit"
    exit 125
else
    echo "Tests failed - marking as bad"
    exit 1
fi
