FROM node:14-alpine

WORKDIR /usr/app/src

COPY package*.json ./

RUN npm install

COPY . .

RUN npx tsc

EXPOSE 3030

CMD ["npm", "start"]