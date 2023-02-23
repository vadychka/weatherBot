FROM node:12.18-alpine

WORKDIR /app

RUN npm install

COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]