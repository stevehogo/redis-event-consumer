import { time } from "../lib/date-utils";
import { EVENT } from "../Contracts/Event";
import { IMessage } from "../Contracts/Message";
import { StreamMessage } from "./StreamMessage";
import crypto from 'crypto';
/**
 * Class Message.
 */
export class Message extends StreamMessage {
    /**
     * @inheritDoc
     * @throws JsonException
     */
    public getData(): any {
        try {
            return JSON.parse(this.content['data']);
        } catch (e) { }
        return null;
    }

    /**
     * Message constructor.
     *
     * @param  meta
     * @param  data
     * @throws JsonException
     */
    constructor(meta: any, data: any) {
        super();
        let payload: any = {
            _id: meta['_id'] || '*',
            original_id: meta['original_id'] || '',
            name: meta['name'],
            data: JSON.stringify(data),
            type: meta['type'] ?? EVENT.TYPE_EVENT,
            version: "1.3",
            domain: meta['domain'] || '',
            created: (meta['created'] || time())
        };
        for (const [key, value] of Object.entries(payload)) {
            if (value === '') {
                delete payload[key];
            } else {
                payload[key] = "" + payload[key];
            }
        }
        const input = `${payload['type']}${payload['name']}${payload['domain']}${payload['data']}`;
        payload['hash'] = crypto.createHash('sha256').update(input).digest('hex');
        this.content = payload;
    }
    /**
     * set new stream name
     * @param name 
     * @returns Message
     */
    public setName(name: string): StreamMessage {
        const data: any = this.content;
        const payload = this.getContent();
        payload['name'] = name;
        const input = `${payload['type']}${payload['name']}${payload['domain']}${payload['data']}`;
        payload['hash'] = crypto.createHash('sha256').update(input).digest('hex');
        this.content = payload;
        return this;
    }
}