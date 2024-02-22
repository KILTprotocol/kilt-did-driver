FROM node:20-alpine as base

WORKDIR /app


FROM base as builder
# Some tools required when using alpine -> https://github.com/nod# ejs/docker-node/issues/282#issue-193774074
RUN apk add --no-cache --virtual .gyp python3 make g++

ARG NODE_AUTH_TOKEN=""

COPY package.json yarn.lock ./

RUN yarn install

# From https://github.com/nodejs/docker-node/issues/282#issue-193774074 (same as above)
RUN apk del .gyp
# copy source after installing dependencies for better caching
COPY . .

RUN yarn bundle


FROM base as release

ENV NODE_ENV production

# carry over the built code
COPY --from=builder /app/dist/index.js /app/.env /app/package.json /app/LICENSE /app/README.md ./

EXPOSE 8080
CMD [ "node", "index.js" ]