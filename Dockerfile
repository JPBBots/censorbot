FROM node:12

WORKDIR /app

COPY package*.json /app/

COPY ./src /app

CMD node .