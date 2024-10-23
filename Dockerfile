FROM node:18

USER 1000:1000

WORKDIR /app/app/
CMD ./start-docker-dev.sh
