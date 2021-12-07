FROM node:14
ARG NODE_AUTH_TOKEN=""

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

# copy source after installing dependencies for better caching
COPY . .

CMD [ "node", "src/index.js" ]