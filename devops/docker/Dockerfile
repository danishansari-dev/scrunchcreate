# Simple single-stage build for academic project
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the React application
RUN npm run build

# Expose port 4173 (Vite preview default)
EXPOSE 6666

# Start Vite preview server (simple for demo)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
