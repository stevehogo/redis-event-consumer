import { Snapshot } from "../Contracts/Snapshot";
import { History } from "../Contracts/History";
import { RedisClient } from "../Redis";

/**
 * Class EventHistory
 */
export class EventHistory extends RedisClient implements History {
    record(snapshot: Snapshot): void {
        throw new Error("Method not implemented.");
    }
    replay(event: string, identifier: string, until: number): any[] {
        throw new Error("Method not implemented.");
    }
}