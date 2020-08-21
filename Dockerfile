FROM node:12

WORKDIR /app

COPY package*.json /app/

RUN npm i

COPY ./src /app

CMD node index.js