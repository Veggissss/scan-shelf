# Node 20-alpine is broken when using npm install...
FROM arm32v7/node:18.20.4-alpine
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