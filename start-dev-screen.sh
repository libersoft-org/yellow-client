#!/bin/sh

screen -dmS yellow-client bash -c "trap bash SIGINT; (./start-dev.sh ; bash);"
