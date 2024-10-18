# Use official node image (latest LTS)
FROM node:lts-alpine

# Set working directory of build stage
WORKDIR /app

# Install required packages
RUN apk add --update --no-cache ffmpeg py3-pip g++ make

# Copy project files to workdir
COPY . .

# Install node modules + Build TypeScript files
RUN npm ci && npm run build

# Run the bot
CMD ["/bin/sh", "entrypoint.sh"]