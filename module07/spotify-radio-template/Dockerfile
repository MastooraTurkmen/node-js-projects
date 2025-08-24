FROM node:18.16.1-slim

RUN apt-get update \
  && apt-get install -y sox libsox-fmt-mp3

# libsox-fmt-all

WORKDIR /spotify-radio/

COPY package.json package-lock.json /spotify-radio/

RUN  npm ci --silent

COPY . .

USER node

CMD npm run live-reload