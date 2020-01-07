FROM node:10-alpine

ENV TZ=America/Chicago
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . /usr/src/app

EXPOSE 3000

CMD [ "npm", "start" ]