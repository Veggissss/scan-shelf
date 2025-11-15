FROM --platform=linux/arm/v7 node:22-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY index.js ./
COPY public.env ./
COPY public ./public

USER node
EXPOSE 3001
CMD ["node", "index.js"]