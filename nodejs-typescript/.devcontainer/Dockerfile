FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

# Install dependencies at image build time (outside the bind-mounted workspace).
COPY package.json package-lock.json ./
RUN npm ci && chown -R node:node /home/node/.npm
