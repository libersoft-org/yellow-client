FROM node:18

RUN apt update && apt install -y curl tini
ENTRYPOINT ["/usr/bin/tini", "--"]

USER 1000:1000

WORKDIR /app/app/
CMD ./start-docker-dev.sh
