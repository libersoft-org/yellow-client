#!/bin/sh

find . -type f -executable -not -path "*/node_modules/*" -not -path "*/.git/*" -not -name "*.sh" -not -name "*.lockb" -not -name "*.fish"
