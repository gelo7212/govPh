FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Clean up
RUN rm -rf src tsconfig.json

EXPOSE 3005

CMD ["npm", "start"]
