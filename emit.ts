import 'dotenv/config';
// import * as path from 'path';
import './src/lib/reset-color'
import { Streamer, Event, IEvent } from './dist';
import setupConfig from '@steveho/ts-config';


const app_env = process.env.NODE_ENV || 'local';
setupConfig(process.cwd(), app_env);

class MyEvent extends Event implements IEvent {
    domain(): string{
        return 'test';
    }
    streams(): Set<string> {
        const s = new Set<string>();
        s.add('blog.streamer.event');
        s.add('blog2.streamer.event');
        s.add('blog3.streamer.event');
        s.add('blog4.streamer.event');
        return s;
    };
    name(): string {
        return 'blog.streamer.event';
    };
    type(): string{
        return this.EVENT;
    };
    payload(): any{
        return {
            message: 'content created at '+ (new Date).getTime()
        };
    };
}
const eventName: string = process.env.EVENT || 'blog.streamer.event';

const streamer = new Streamer();
(async ()=>{
    await streamer.asEmit(new MyEvent());

    process.exit(0)
})();