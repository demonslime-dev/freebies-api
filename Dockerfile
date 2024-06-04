FROM node:20-bookworm

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npx -y playwright install firefox --with-deps

COPY . .

RUN npx prisma generate

ENV PORT=80

EXPOSE $PORT

CMD ["npm", "start"]
