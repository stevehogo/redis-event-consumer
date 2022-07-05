import { IEvent } from "./Event";

/**
 * Interface Emitter.
 */
export interface Emitter {
    /**
     * @param  event
     *
     * @param  id
     * @return string
     */
     asEmit(event: IEvent, id: string): Promise<string>;
}