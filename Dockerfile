ARG TARGETPLATFORM
# Stage 1: Build the application (Non-ARM)
FROM --platform=linux/amd64 node:22.21.1-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --verbose
COPY . .
RUN npm run build

# Stage 2: Serve the application
FROM --platform=${TARGETPLATFORM} node:22-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

# Install production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy runtime artifacts
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]