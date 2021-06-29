FROM node:14.14-alpine AS builder

WORKDIR /app

COPY package.json /app

RUN yarn 

COPY . /app

RUN yarn build

# production 
FROM nginx:alpine
COPY ./ci_scripts/conf_files/.htpasswd /etc/nginx/conf.d/.htpasswd
COPY ./ci_scripts/conf_files/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
