#!/usr/bin/env fish

ps  -flye -H | grep -i /home/koom/.bun/bin/prettier | grep -v grep

