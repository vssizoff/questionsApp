FROM node:22.4.0-alpine3.19

WORKDIR /app

COPY . .

RUN npm i
RUN npm run build

CMD ["node", "./dist/main.js"]