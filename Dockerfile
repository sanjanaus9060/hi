FROM node:18

WORKDIR /app

COPY homemade-delivery/ .

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
