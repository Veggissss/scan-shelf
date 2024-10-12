# Stage 1: Build the application (Non-ARM)
FROM --platform=linux/amd64 node:18.20.4-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --verbose
COPY . .
RUN npm run build

# Stage 2: Serve the application (ARM)
FROM arm32v7/node:18.20.4-alpine AS production
WORKDIR /app
COPY --from=build /app .
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]