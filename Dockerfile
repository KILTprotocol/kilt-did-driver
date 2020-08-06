FROM node:12.18-alpine
ARG NODE_AUTH_TOKEN=""

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

# copy source after installing dependencies for better caching
COPY . .

EXPOSE 8080

CMD [ "node", "src/index.js" ]