FROM node:22.4.0-alpine3.19 as frontend-builder

WORKDIR /app

COPY ./frontend .

RUN npm i
RUN npm run build

FROM nginx:1.27.0-alpine3.19 as server

COPY --from=frontend-builder /app/dist /frontend
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]