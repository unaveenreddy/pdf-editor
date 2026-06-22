FROM node:20-alpine

WORKDIR /app

COPY client/package.json client/package-lock.json* ./client/
COPY server/package.json server/package-lock.json* ./server/
COPY package.json .
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]
