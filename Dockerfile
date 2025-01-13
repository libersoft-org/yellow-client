FROM node:18

ARG UID=1000
ARG GID=1000

RUN apt update && apt install -y curl tini
ENTRYPOINT ["/usr/bin/tini", "--"]

RUN mkdir -p /.npm && chown -R $UID:$GID /.npm

ARG APP_DIR=/app/app/
RUN mkdir -p $APP_DIR
RUN chown $UID:$GID $APP_DIR
USER $UID:$GID
WORKDIR $APP_DIR

CMD ./start-docker-dev.sh
