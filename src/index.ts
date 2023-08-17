// Core dependencies
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'node:url';
import { execSync } from "child_process";

// Server dependecies
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import Express from './Express/index.js';

// Config Setup
const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: __dirname + '/.env' });

const config = JSON.parse(fs.readFileSync(__dirname + '/../config.json', 'utf-8'));

// Express Setup
const app = express();

// HttpServer & socket Setup
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config['cors'],
    methods: ['GET', 'POST'],
  },
});

// Starting webserver and socket
httpServer.listen(config['http_port'], () => {
    console.log(`Listening on port: ${config['http_port']}`);
});

io.listen(config['socket_port']);

Express();

export { app, io, config, __dirname }