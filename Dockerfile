FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY app.js index.html capture.html server.js styles.css fonts.css legal.css ./
COPY terms.html privacy.html cookies.html content-policy.html accessibility.html ./
COPY assets ./assets

ENV NODE_ENV=production
ENV PORT=4173

RUN mkdir -p /app/data && chown -R node:node /app/data

EXPOSE 4173

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD node -e "fetch('http://127.0.0.1:4173/api/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["npm", "start"]
