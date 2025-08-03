# TerpCrawl — Real-Time Video Chat Platform

**Project Status:** Ongoing Development

## Setup

- Run `npm install` to install dependencies
- Run `nodemon devStart` to start the server and view the website on localhost
- Run `mkcert create-ca` and `mkcert create-cert` to generate HTTPS certificates for local development
- Create a `.env` file for database and email login credentials with the following variables:
  - `DATABASE_URL`
  - `DB_NS`
  - `EMAIL_USER`
  - `EMAIL_PASS`

## Current Features

- Peer-to-peer video calling between university students using WebRTC and Socket.io
- Secure user authentication with email verification via Nodemailer
- User account creation with hashed passwords using bcrypt
- Basic front-end interface for video calls

## Upcoming Features

- Managing video call queue with "Omegle"-style random matching
- JWT-based login persistence for seamless session management
- Real-time text chat alongside video calls
- Enhanced user account flexibility and profile management
- Display of current active user count
- Complete front-end design overhaul for improved user experience
- Deployment and hosting setup
