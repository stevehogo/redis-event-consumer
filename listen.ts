import 'dotenv/config';
import * as path from 'path';
import './src/lib/reset-color'
import { ReceivedMessage, MessageReceiver, ListenCommand, Streamer } from './dist';
import setupConfig from '@steveho/ts-config';

const app_env = process.env.NODE_ENV || 'local';
setupConfig(path.join(__dirname, 'dist'), app_env);


const eventName: string = process.env.EVENT || 'blog.streamer.event';

// const last_id = process.env.last_id || '0-0';
// const group = process.env.group;
// const consumer = process.env.consumer;

const handler: MessageReceiver = {
    handle(message: ReceivedMessage) {
        
        console.log('>>> ', JSON.stringify(message.getData()))
    }
}
const listeners: any = {};
listeners[eventName] = [
    handler
];
const command = new ListenCommand(listeners);
command.on('stop', () => {
    process.exit(0);
});
command.on('error', (err) => {
    console.error(err);
    process.exit(0);
});
command.run();