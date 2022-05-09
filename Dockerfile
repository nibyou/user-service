FROM node:16-alpine

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --immutable --immutable-cache

COPY . .

CMD ["npm", "start"]