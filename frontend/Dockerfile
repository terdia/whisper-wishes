# Development stage
FROM node:18-alpine

RUN apk add --no-cache curl

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Use build version to force cache invalidation
ARG BUILD_VERSION
RUN echo "Build version: ${BUILD_VERSION}"

# Expose the port Next.js runs on
EXPOSE 3000

# Start the app
CMD ["/bin/sh", "-c", "npm run build && npm start"]