FROM node:16-alpine

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --immutable --immutable-cache

COPY . .

EXPOSE 3000
RUN npm run build
CMD ["npm", "run", "start:prod"]