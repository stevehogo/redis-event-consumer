import { createClient } from 'redis'
export class RedisClient {
    private client;
    private isConnected: boolean;
    constructor() {
        const host = process.env.REDIS_HOST;
        const port = process.env.REDIS_PORT;
        const db = process.env.REDIS_DB || 0;
        this.isConnected = false;
        this.client = createClient({
            url: `redis://${host}:${port}/${db}`
        })
    }
    public async redis() {

        try {
            if (!this.isConnected) await this.client.connect();
        } catch (e) { }
        this.isConnected = true;
        return this.client;
    }
}