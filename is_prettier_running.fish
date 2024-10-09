#!/usr/bin/env fish

ps -eLf | grep -i /home/koom/.bun/bin/prettier | grep -v grep

