FROM node:16-alpine
# Some tools required when using alpine -> https://github.com/nodejs/docker-node/issues/282#issue-193774074
RUN apk add --no-cache --virtual .gyp python3 make g++

ARG NODE_AUTH_TOKEN=""

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

RUN apk del .gyp

# copy source after installing dependencies for better caching
COPY . .

CMD [ "node", "src/index.js" ]