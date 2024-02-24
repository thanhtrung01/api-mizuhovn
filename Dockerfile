# Stage 1: Install Dependencies
FROM node:16-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install

# Stage 2: Build Production
FROM node:16-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN yarn install --production

CMD ["yarn", "start"]
EXPOSE 3000
