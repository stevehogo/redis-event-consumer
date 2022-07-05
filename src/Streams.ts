import Stream, { STREAM } from "./Stream";
import { StreamableMessage } from "./Contracts/StreamableMessage";
import { RedisClient } from "./Redis";
import { commandOptions } from 'redis';
/**
 * Class Streams.
 * 
 */
export class Streams extends RedisClient {
    private streams: Set<string>;
    /**
     * Streams constructor.
     *
     * @param {array} streams
     */
    constructor(streams: Set<string>) {
        super();
        this.streams = streams;
    }
    /**
     * @param  {StreamableMessage}  message
     * @param  {string}  id
     *
     * @return {array}
     */

    async add(message: StreamableMessage, id: string = '*'): Promise<Array<string>> {
        const ids = [];

        for (const stream of this.streams.values()) {
            const _stream = new Stream(stream);
            ids.push(await _stream.add(message, id));
        }
        return ids;
    }

    /**
     * @param {Map<string, string>}    from
     * @param {number} limit
     *
     * @return {array}
     */

    async read(from: Map<string, string>, limit: number = 0): Promise<any> {
        const read = [];
        for (const stream of this.streams.values()) {
            read.push({
                key: stream,
                id: from.get(stream) || STREAM.FROM_START
            });
        }
        let opts = { COUNT: limit, BLOCK: 1000 };
        return (await this.redis()).xRead(commandOptions({ isolated: true }), read, opts);
    }
}