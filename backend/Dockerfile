FROM node:20-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001 -G nodejs

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN chown -R nodeuser:nodejs /app

USER nodeuser

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

EXPOSE 5000

CMD ["node", "server.js"]
