FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# We will use a custom command in docker-compose or here to ensure migration/seed
CMD ["sh", "-c", "npx prisma db push && npm run seed && npm start"]
