FROM node:16

ARG NPM_TOKEN

WORKDIR /app/website

COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY next.config.js next.config.js
COPY next-env.d.ts next-env.d.ts

COPY .npmrc .npmrc
RUN npm i