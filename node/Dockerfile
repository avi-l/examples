FROM node:14.14-alpine

RUN apk --no-cache add \
      bash \
      g++ \
      ca-certificates \
      lz4-dev \
      musl-dev \
      cyrus-sasl-dev \
      openssl-dev \
      make \
      python2

RUN apk add --no-cache --virtual .build-deps gcc zlib-dev libc-dev bsd-compat-headers py2-setuptools bash

WORKDIR /app

COPY package.json /app

RUN npm install mongoose express node-rdkafka

RUN yarn

COPY . /app

# remove unnecessary deps
RUN rm -rf /app/node_modules/node-rdkafka/deps/
RUN rm -rf /app/node_modules/node-rdkafka/build/deps/*.a

CMD node server.js

EXPOSE 4000 
