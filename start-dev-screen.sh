#!/bin/sh

screen -dmS yellow-client bash -c ". ./colors.sh; trap bash SIGINT; (./start-dev.sh ; bash);"
