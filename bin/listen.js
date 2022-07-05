#!/usr/bin/env node

require('dotenv').config();
require('../dist/lib/reset-color');
const { ListenCommand } = require('../dist');
const setupConfig = require('@steveho/ts-config').default;
const app_env = process.env.NODE_ENV || 'local';
const config = setupConfig(process.cwd(), app_env);

const listeners = config('streamer.listeners');
const command = new ListenCommand(listeners);
command.on('stop', () => {
    process.exit(0);
});
command.on('error', (err) => {
    console.error(err);
    process.exit(0);
});
command.run();