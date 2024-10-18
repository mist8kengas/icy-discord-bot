# icy-discord-bot

A simple Discord music radio bot that plays audio from an Icecast endpoint

## Configuration

See the `.env.example` file for more information

## Installation

> [!TIP]
> It is recommended to run the bot using Docker

### Docker

1. Pull the image from the registry:
   ```
   docker pull ghcr.io/mist8kengas/icy-discord-bot:latest
   ```
2. Run the container:

   a. via `docker run`

   ```
   docker run --name icy-discord-bot --restart unless-stopped --env-file .env ghcr.io/mist8kengas/icy-discord-bot:latest
   ```

   b. via `docker compose` (see `docker-compose.yml`)

### Node.js

Requirements:

- `ffmpeg`
- `python3`
- `GNU c++`
- `make`

Installation:

1. Clone repository:
   ```
   git clone https://github.com/mist8kengas/icy-discord-bot
   ```
2. Install node packages:
   ```
   npm install
   ```
3. Deploy application commands:
   ```
   npm run put-commands
   ```
4. Run the application:
   ```
   npm start
   ```
