FROM node:8

WORKDIR /usr/local/app
RUN mkdir src
COPY LICENSE package.json package-lock.json webpack.common.js webpack.dev.js ./
RUN npm install --no-progress --ignore-optional

CMD npm run start