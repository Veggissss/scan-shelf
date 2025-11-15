FROM arm32v7/node:22.21.1-alpine AS production
ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --verbose
RUN mv node_modules ../
COPY . .
RUN chown -R node /usr/src/app
USER node
EXPOSE 3001

CMD ["npm", "start"]