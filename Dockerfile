FROM node:12

WORKDIR /app

COPY ./bot /app

CMD npm run start