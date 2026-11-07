FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY app.js index.html server.js styles.css ./

ENV NODE_ENV=production
ENV PORT=4173

EXPOSE 4173

USER node

CMD ["npm", "start"]
