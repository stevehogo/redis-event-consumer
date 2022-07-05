import { StreamableMessage } from "./Contracts/StreamableMessage";
import { Waitable } from "./Contracts/Waitable";
import { RedisClient } from "./Redis";
import { getTimeStamp } from "./lib/date-utils";
import { commandOptions } from 'redis';
import { StreamNotFoundException } from "./Exceptions/StreamNotFoundException";
import { RANGE } from './Stream/Range';

export enum STREAM {
    STREAM = 'STREAM',
    GROUPS = 'GROUPS',
    CREATE = 'CREATE',
    CONSUMERS = 'CONSUMERS',
    NEW_ENTRIES = '$',
    FROM_START = '0'
}

export default class Stream extends RedisClient implements Waitable {
    private name: string;

    /**
     * Stream constructor.
     *
     * @param name
     */
    constructor(name: string) {
        super();
        this.name = name;
    }

    /**
     * @return string
     */
    public getName(): string {
        return this.name;
    }

    /**
     * @return string
     */
    public getNewEntriesKey(): string {
        return STREAM.NEW_ENTRIES;
    }

    public async await(lastSeenId: string = STREAM.FROM_START, timeout: number = 0, limit: number = 0): Promise<any> {
        let opts = { BLOCK: timeout, COUNT: limit }
        return (await this.redis()).xRead(
            commandOptions({ isolated: true }),
            { key: this.name, id: lastSeenId },
            opts
        );
    }

    public acknowledge(id: string): void {
        // When listening on Stream without a group we are not acknowledging any messages
    }

    /**
     * @param  message
     * @param  id
     *
     * @return string
     */
    public async add(message: StreamableMessage, id: string = '*'): Promise<string> {
        const data: any = JSON.parse(JSON.stringify(message.getContent()));
        return (await this.redis()).xAdd(this.name, id, data);
    }

    /**
     * @param  from
     * @param  limit
     *
     * @return array
     */
    public async read(from: string = STREAM.FROM_START, limit: number = 0): Promise<any> {
        let opts = { BLOCK: 1000 }

        if (limit) {
            opts = Object.assign({}, opts, {
                COUNT: limit
            });
        }
        return (await this.redis()).xRead(
            commandOptions({ isolated: true }),
            { key: this.name, id: from },
            opts
        );
    }
    /**
     * @param  id
     *
     * @return number
     */
    public async delete(id: string): Promise<number> {
        return (await this.redis()).xDel(this.name, [id]);
    }

    /**
     * @param  name
     * @param  from
     * @param  createStreamIfNotExists
     * @return Promise<string>
     */
    public async createGroup(name: string, from: string = STREAM.FROM_START, createStreamIfNotExists: boolean = true): Promise<string> {
        if (createStreamIfNotExists) {
            return (await this.redis()).xGroupCreate(this.name, name, from, {
                MKSTREAM: true,
            });
        }
        return (await this.redis()).xGroupCreate(this.name, name, from);
    }

    /**
     * Return all pending messages from given group.
     * Optionally it can return pending message for single consumer.
     *
     * @param group
     * @param consumer
     *
     * @return Promise<any>
     */
    public async pending(group: string, consumer: string = ''): Promise<any> {
        const pending = await (await this.redis()).xPending(this.name, group);
        const pendingCount = pending ? pending.pending : 0;

        if (consumer != '') {
            return (await this.redis()).xPendingRange(this.name, group, RANGE.FIRST, RANGE.LAST, pendingCount, {
                consumer
            });
        }

        return (await this.redis()).xPendingRange(this.name, group, RANGE.FIRST, RANGE.LAST, pendingCount);
    }
    /**
     * @return Promise<number>
     */
    public async len(): Promise<number> {
        return (await this.redis()).xLen(this.name);
    }

    /**
     * @throws StreamNotFoundException
     *
     * @return array
     */
    public async info(): Promise<any> {
        const result = await (await this.redis()).xInfoStream(this.name);
        if (!result) {
            throw new StreamNotFoundException(`No results for stream ->${this.name}`);
        }
        return result;
    }

    /**
     * @return array
     * @throws StreamNotFoundException
     *
     */
    public async groups(): Promise<Array<any>> {
        const result = await (await this.redis()).xInfoGroups(this.name);
        if (!result) {
            throw new StreamNotFoundException(`No groups for stream ->${this.name}`);
        }

        return result;
    }

    /**
     * @param string group
     *
     * @throws StreamNotFoundException
     *
     * @return array
     */
    public async consumers(group: string): Promise<Array<any>> {
        const result = await (await this.redis()).xInfoConsumers(this.name, group);
        if (!result) {
            throw new StreamNotFoundException(`No consumers for stream ${this.name}->${group}`);
        }

        return result;
    }

    /**
     * @param name
     *
     * @return bool
     */
    public async groupExists(name: string): Promise<boolean> {
        let groups;
        try {
            groups = await this.groups();
        } catch (ex) {
            return false;
        }
        const group = groups.find(x => x['name'] == name);

        return !!group;
    }
}