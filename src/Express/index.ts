// Core dependencies
import * as fs from 'fs';
import path from 'path';

// Express & socket import
import express from 'express';
import session from 'express-session';
import JSession from 'express-session-json';
import { Socket } from "socket.io";
const JsonStore = JSession(session);

// Axios
import axios from 'axios';

// Custom utilities
import { __dirname, app, config, io } from "../index.js";
import Cloudflare from '../Cloudflare/index.js';

export default async function Express() {
    app.use(express.static('public'));
    app.set('view engine', 'ejs');

    app.use(session({
        secret: process.env.EXPRESS_SECRET,
        resave: false,
        saveUninitialized: true,
        store: new JsonStore({
            path: `${__dirname}/..`
        })
    }));

    app.get('/', isAuthenticated, (req, res, next) => {
        res.render(`${__dirname}/../views/index.ejs`, { access_token: req.session.user['access_token'], domain: config[`domain`], socket_port: config[`socket_port`] });
    });

    app.get('/list', isAuthenticated, (req, res, next) => {
        res.render(`${__dirname}/../views/list.ejs`, { access_token: req.session.user['access_token'], domain: config[`domain`], socket_port: config[`socket_port`] });
    });

    app.get('/logout', isAuthenticated, async (req, res, next) => {
        await new Promise<void>((resolve, reject) => {
            req.session.destroy(function (err) {
                reject(err);
            });

            resolve();
        });

        res.redirect('/');
    });

    app.get('/auth', async (req, res, next) => {
        const code = req.query.code;
        try {
            const response = await axios.post('https://discord.com/api/v10/oauth2/token', {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: config['discord_redirect_uri'],
            },
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });

            const { access_token, token_type, refresh_token } = response.data;

            const profile = await getProfile(access_token);

            if (!config['allowed_users'].includes(profile.id)) return res.render(`${__dirname}/../views/error.ejs`, { title: `Auth error`, description: `Hey ${profile.global_name}! You're not whitelisted here, ask zyrenth to whitelist you and try again later.`, domain: config[`domain`], socket_port: config[`socket_port`] });

            req.session.user = {
                access_token,
                token_type,
                refresh_token
            };

            res.redirect('/');
        } catch (error) {
            return res.render(`${__dirname}/../views/error.ejs`, { title: `Auth error`, description: `Something went wrong while communicating with discord.`, domain: config[`domain`], socket_port: config[`socket_port`] });
        };
    });

    app.get('*', (req, res) => {
        res.render(`${__dirname}/../views/error.ejs`, { title: `404 - Not found`, description: `Your epic url (${req.params['0']}) doesn't exist on this server.`, domain: config[`domain`], socket_port: config[`socket_port`] });
    });

    // Socket event listeners
    io.use(async (socket, next) => {
        if (socket.handshake.query && socket.handshake.query.token) {
            const profile = await getProfile(socket.handshake.query.token);

            if (profile === null) return socket.disconnect();

            if (!config['allowed_users'].includes(profile.id)) return socket.disconnect();

            next();
        } else {
            socket.disconnect();
        };
    }).on('connection', (socket: Socket) => {
        // Activate sub-domain.
        socket.on('activate', async (data) => {
            if (!(data && data.sub && data.record)) return socket.emit('activate', false);

            if(!/^(?!.*--)[A-Za-z0-9-]+$/.test(data.sub) || !/^[a-zA-Z0-9]*$/.test(String(data.record).replace(`dh=`, ``)) || !String(data.record).startsWith(`dh=`) || data.sub.length > 63 || data.sub.endsWith(`-`)) return socket.emit('activate', false);

            if(!fs.existsSync(path.join(`${__dirname}`, `..`, `records.json`))) fs.writeFileSync(path.join(`${__dirname}`, `..`, `records.json`), `{}`, `utf-8`);

            let records = JSON.parse(fs.readFileSync(path.join(`${__dirname}`, `..`, `records.json`), 'utf-8'));

            const profile = await getProfile(socket.handshake.query.token);

            const cf = new Cloudflare();

            const record = await cf.getTXTRecord(data.sub);

            if(!record) if(!await cf.addTXTRecord(data.sub, data.record)) return socket.emit('activate', false);
            
            if(record) if(!await cf.editTXTRecord(record, data.record)) return socket.emit('activate', false);

            if(!records[data.sub]) records[data.sub] = [{
                record: data.record,
                user: {
                    id: profile.id,
                    name: profile.username
                },
                date: Date.now()
            }];
            else records[data.sub].push({
                record: data.record,
                user: {
                    id: profile.id,
                    name: profile.username
                },
                date: Date.now()
            });

            fs.writeFileSync(path.join(`${__dirname}`, `..`, `records.json`), JSON.stringify(records, null, 4), 'utf-8');

            socket.emit('activate', true);
        });

        socket.on('records', () => socket.emit('records', JSON.parse(fs.readFileSync(path.join(`${__dirname}`, `..`, `records.json`), 'utf-8'))));

        // Discord OAuth profile
        socket.on('get_profile', async () => {
            socket.emit('get_profile', await getProfile(socket.handshake.query.token));
        });

        // Disconnect event
        socket.on('disconnect', () => {
            // log('Socket disconnected.');
        });
    });
};

// Check if Discord OAuth token is valid
async function isAuthenticated(req, res, next) {
    if (req.session.user) {
        const profile = await getProfile(req.session.user.access_token);

        if (profile === null) return res.redirect(config[`discord_auth_url`]);

        if (!config['allowed_users'].includes(profile.id)) return res.redirect(config[`discord_auth_url`]);

        next();
    } else res.redirect(config[`discord_auth_url`]);
};

// Get Discord profile based on OAuth token
async function getProfile(token) {
    try {
        const response = await axios.get('http://discord.com/api/v10/users/@me',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${token}`
                }
            });

        return response.data;
    } catch (error) {
        return null;
    };
};