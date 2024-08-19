FROM node:20-alpine AS base

WORKDIR /app


FROM base AS builder


COPY package.json yarn.lock ./

RUN yarn install --immutable

# copy source after installing dependencies for better caching
COPY . .

RUN yarn bundle


FROM base AS release

ENV NODE_ENV production

# carry over the built code
COPY --from=builder /app/dist/index.js /app/.env /app/package.json /app/LICENSE /app/README.md ./

EXPOSE 8080
CMD [ "node", "index.js" ]