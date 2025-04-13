FROM ubuntu:24.04

ARG UID=1000
ARG GID=1000
ARG COMMAND

# Create and set permissions for /tmp directory
RUN mkdir -p /tmp && chmod 1777 /tmp
RUN touch /tmp/.test

ENV TMPDIR=/var/tmp
RUN mkdir -p /var/tmp

RUN apt-get update && apt-get install -y tini curl unzip nodejs npm
ENTRYPOINT ["/usr/bin/tini", "--"]

RUN mkdir -p /.npm && chown -R $UID:$GID /.npm


ARG APP_DIR=/app/app/
RUN mkdir -p $APP_DIR
RUN chown $UID:$GID $APP_DIR
RUN mkdir /.bun
RUN chown $UID:$GID /.bun
USER $UID:$GID
WORKDIR $APP_DIR

RUN curl -fsSL https://bun.sh/install | bash

CMD ${COMMAND}

