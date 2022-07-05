import * as path from 'path';
import { Listener } from "../Contracts/Listener";
import { Emitter } from "../Contracts/Emitter";
import { IEvent } from "../Contracts/Event";
import { time } from "../lib/date-utils";
import { Message } from './Message';
import Stream from "../Stream";
import { Waitable } from "../Contracts/Waitable";
import { isHandler } from "../Contracts/ListenerHandler";
import { Consumer } from "../Stream/Consumer";
import { EventHistory } from "../History/EventHistory";
import { sleep } from "../lib/sleep";
import { ReceivedMessage } from "./ReceivedMessage";
import { EventEmitter } from 'events';
import appConfig from '@steveho/ts-config';
import { Streams } from '../Streams';
// import streamer from '../config/streamer';

/**
 * Class Streamer.
 */
export class Streamer extends EventEmitter implements Emitter, Listener {
    protected _startFrom: string;
    protected domain: string;
    protected readTimeout: number;
    protected listenTimeout: number;
    protected readSleep: number;
    protected readLimit: number;
    private group: string = '';
    private consumer: string = '';
    private canceled: boolean = false;
    private inLoop: boolean = false;
    private history: EventHistory;

    /**
     * Listener constructor.
     *
     */
    constructor() {
        super();
        const config = appConfig(process.cwd(), process.env.APP_ENV || '');
        const streamer: any = config('streamer');
        this.domain = streamer.domain;
        this.readTimeout = streamer.stream_read_timeout;
        this.listenTimeout = streamer.listen_timeout;
        this.readSleep = streamer.read_sleep;
        this.readLimit = streamer.read_limit;
        this.readTimeout *= 1000;
        this.listenTimeout *= 1000;
        this.readSleep *= 1000;
        this.history = new EventHistory();
    }
    /**
     * @inheritdoc
     * @throws JsonException
     */

    async asEmit(event: IEvent, id: string = '*'): Promise<string> {
        const meta = {
            type: event.type(),
            domain: this.domain,
            name: event.name(),
            created: time()
        };
        let stream;
        const message = new Message(meta, event.payload());        
        const streams: any = event.streams();
        let size = (streams.size || streams.length);

        if(size > 1){
            const _streams = new Set<string>();
            for(const key of streams.values()){
                _streams.add(key);
            }
            stream = new Streams(_streams);
            const result = await stream.add(message, id);
            return result.join(',');
        }else{
            stream = new Stream(event.name());
            return stream.add(message, id);
        }        
    }
    /**
     * Handler is invoked with \Prwnr\Streamer\EventDispatcher\ReceivedMessage instance as first argument
     * and with \Prwnr\Streamer\EventDispatcher\Streamer as second argument
     *
     * @inheritdoc
     *
     * @throws Throwable
     */
    listen(event: string, handler: any): void {
        if (this.inLoop) {
            return;
        }

        const stream = new Stream(event);

        try {
            if (this.group == '' || this.consumer == '') {
                this.listenOn(stream, handler);
            }

            this.adjustGroupReadTimeout();
            this.listenOn(new Consumer(this.consumer, stream, this.group), handler);
        } catch (e) {
            this.report('--', stream, e);
        }
        finally {
            this.inLoop = false;
        }
    }

    /**
     * @param startFrom
     *
     * @return Streamer
     */
    public startFrom(startFrom: string): Streamer {
        this._startFrom = startFrom;
        return this;
    }
    /**
     * @param  consumer
     * @param  group
     *
     * @return Streamer
     */
    public asConsumer(consumer: string, group: string): Streamer {
        this.consumer = consumer;
        this.group = group;

        return this;
    }
    /**
     * Cancels current listener loop.
     */
    public cancel(): void {
        this.canceled = true;
    }

    /**
     * @param  on
     * @param  handler
     */
    private async listenOn(on: Waitable, handler: any): Promise<void> {
        let start = time();
        let lastSeenId = this._startFrom || on.getNewEntriesKey();

        while (!this.canceled) {
            this.inLoop = true;
            // console.log('lastSeenId', lastSeenId)
            /**
             * @var on Stream
             */
            try {
                const payload = await on.await(lastSeenId, this.readTimeout, this.readLimit);
                if (payload == null) {
                    if (on.getNewEntriesKey() === Consumer.NEW_ENTRIES) {
                        lastSeenId = on.getNewEntriesKey();
                    }
                    await sleep(this.readSleep);
                    let stop = this.shouldStop(start);
                    if (stop) {
                        this.emit('stop');
                        break;
                    }
                    continue;
                }

                lastSeenId = this.processPayload(payload, on, handler);
                lastSeenId = lastSeenId ? lastSeenId : on.getNewEntriesKey();
                start = time();
            } catch (se) {
                this.report(lastSeenId, on, se);
                break;
            }
        }
    }

    /**
     * @param  start
     *
     * @return bool
     */
    private shouldStop(start: number): boolean {
        if (this.listenTimeout === 0) {
            return false;
        }
        const now = time();
        console.log("shouldStop >> check ", now - start, now);
        if (now - start > this.listenTimeout) {
            return true;
        }

        return false;
    }
    /**
     * @param  payload
     * @param  on
     * @param  handler
     *
     * @return string
     */
    private processPayload(payload: any, on: Waitable, handler: any): string {
        let messageId: string = '';
        const { messages } = payload.find((x: any) => x.name == on.getName());
        for (let i in messages) {
            try {
                let { id, message } = messages[i];
                messageId = id;
                this.forward(messageId, message, handler);
                on.acknowledge(messageId);
                if (this.canceled) {
                    break;
                }
            } catch (ex) {
                this.report(messageId, on, ex);
                continue;
            }
        }

        return messageId;
    }
    /**
     * @param  messageId
     * @param  message
     * @param  handler
     * @throws JsonException
     */
    private forward(messageId: string, message: any, handler: any): void {
        if (typeof handler == 'function') {
            return handler(new ReceivedMessage(messageId, message), this);
        }
        if (isHandler(handler)) {
            return handler.handle(new ReceivedMessage(messageId, message), this);
        }
    }
    /**
     * When listening on group, timeout should not be equal to 0, because it is required to know
     * when reading history of message is finished and when listener should start
     * reading only new messages via '>' key.
     */
    private adjustGroupReadTimeout(): void {
        if (this.readTimeout === 0) {
            this.readTimeout = 2000;
        }
    }

    /**
     * @param  id
     * @param  on
     * @param  ex
     */
    private report(id: string, on: Waitable, ex: Error): void {
        let error = `Listener error. Failed processing message with ID ${id} on '${on.getName()}' stream. Error: ${ex.message}`;
        console.error(error);
        this.emit('error', error);
    }
}