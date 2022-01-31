FROM node:16-alpine3.14

WORKDIR /app

COPY package.json ./

RUN yarn

COPY . .

CMD ["npm", "start"]
