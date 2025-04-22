@echo off
IF EXIST build (
 rmdir /s /q build
)
bun i --frozen-lockfile
bun --bun run build
