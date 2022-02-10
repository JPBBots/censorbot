FROM node:16

WORKDIR /app/bot

ARG NPM_TOKEN

COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY .npmrc .npmrc

RUN npm i
