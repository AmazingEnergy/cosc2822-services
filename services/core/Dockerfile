FROM node:18.16.0-alpine3.17

RUN apk --no-cache add curl

RUN mkdir -p /app
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 80
CMD [ "npm", "start"]