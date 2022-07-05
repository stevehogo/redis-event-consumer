import { Snapshot } from "./Snapshot";

/**
 * Interface History
 */
export interface History
{
    /**
     * Records snapshot information in Redis.
     *
     * @param  Snapshot  $snapshot
     */
    record(snapshot: Snapshot): void;

    /**
     * Replays event history by its specific identifier.
     *
     * @param event
     * @param identifier
     * @param until
     * @return array
     */
    replay(event: string, identifier: string, until: number): Array<any>;
}