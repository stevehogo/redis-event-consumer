import { RedisClient } from "../Redis";
import { Waitable } from "../Contracts/Waitable";
import Stream from "../Stream";

/**
 * Class Consumer.
 */
export class Consumer extends RedisClient implements Waitable {

    static readonly NEW_ENTRIES = '>';

    private consumer: string;
    private stream: Stream;
    private group: string;

    /**
     * Consumer constructor.
     *
     * @param consumer
     * @param stream
     * @param group
     */
    constructor(consumer: string, stream: Stream, group: string) {
        super();
        this.consumer = consumer;
        this.stream = stream;
        this.group = group;
    }

    /**
     * @return string
     */
    public getName(): string {
        return this.stream.getName();
    }

    /**
     * @return string
     */
    public getNewEntriesKey(): string {
        return Consumer.NEW_ENTRIES;
    }

    /**
     * {@inheritdoc}
     */
    public async await(lastSeenId = Consumer.NEW_ENTRIES, timeout: number = 0, limit: number = 0): Promise<any> {

        return (await this.redis()).xReadGroup(
            this.group, this.consumer, 
            {
                key: this.getName(),
                id: lastSeenId
            },
            {
                COUNT: limit,
                BLOCK: timeout
            }
        );
    }

    /**
     * {@inheritdoc}
     *
     * @throws Error
     */
    public async acknowledge(id: string): Promise<void> {
        const result = await (await this.redis()).xAck(this.getName(), this.group, [id]);

        if (result === 0) {
            throw new Error(`Could not acknowledge message with ID ${id}`);
        }
    }

    /**
     * Return pending message only for this particular consumer.
     *
     * @return array
     */
    public async pending(): Promise<Array<any>> {
        return this.stream.pending(this.group, this.consumer);
    }

    /**
     * Claim all given messages that have minimum idle time of $idleTime milliseconds.
     *
     * @param  ids
     * @param  idleTime
     * @param  justId
     *
     * @return array
     */
    public async claim(ids: Array<string>, idleTime: number, justId: boolean = true): Promise<Array<any>> {
        if (justId) {
            return (await this.redis()).xClaimJustId(
                this.getName(), this.group, this.consumer, idleTime, ids
            );
        }

        return (await this.redis()).xClaim(
            this.getName(), this.group, this.consumer, idleTime, ids
        );
    }
}
