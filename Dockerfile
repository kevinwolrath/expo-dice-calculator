FROM node:20-alpine

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# Install dependencies (run postinstall if present)
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit --silent || npm install --no-audit --silent

# Copy source
COPY . .

# Expo web port
EXPOSE 19006

# Allow devtools to bind
ENV EXPO_DEVTOOLS_LISTEN_HOST=0.0.0.0

# Start Expo in web-only mode
CMD ["npm", "run", "web", "--", "--host", "lan", "--port", "19006", "--web-only"]
