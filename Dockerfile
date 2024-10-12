# Stage 1: Build the application
FROM arm32v7/node:alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application
FROM arm32v7/node:alpine AS production
WORKDIR /app
COPY --from=build /app .
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]