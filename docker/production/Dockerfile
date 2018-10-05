FROM node:8 as builder
WORKDIR /usr/local/app
RUN mkdir src
ADD ./src src
COPY LICENSE package.json package-lock.json webpack.common.js webpack.prod.js ./
RUN npm install --no-progress --ignore-optional
RUN npm run build
RUN ls


FROM nginx:alpine
COPY --from=builder /usr/local/app/dist /usr/share/nginx/html