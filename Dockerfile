FROM node:12-alpine
ARG NODE_AUTH_TOKEN=""

WORKDIR /app

COPY package.json yarn.lock ./
# optionally copy a npmrc. (we could change the npm registry to pull the latest kilt sdk)
COPY .npmrc ./

RUN yarn install

# copy source after installing dependencies for better caching
COPY . .

EXPOSE 8080

CMD [ "node", "src/index.js" ]