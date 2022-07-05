/**
 * Interface Event.
 */
export enum EVENT {
    TYPE_EVENT = 'event',
    TYPE_NOTIFICATION = 'notification',
    TYPE_COMMAND = 'command'
}
export interface IEvent {
    streams(): Set<string>;
    /**
     * Event name. Can be any string
     * This name will be later used as event name for listening.
     *
     * @return string
     */
    name(): string;

    /**
     * Event type. Can be one of the predefined types from this contract.
     *
     * @return string
     */
    type(): string;

    /**
     * Event payload that will be sent as message to Stream.
     *
     * @return array
     */
    payload(): Array<any>;

    get EVENT(): string;
    get NOTIFICATION(): string;
    get COMMAND(): string;

}

export abstract class Event implements IEvent {
    streams(): Set<string> {
        throw new Error("Method not implemented.");
    }
    name(): string {
        throw new Error("Method not implemented.");
    }
    type(): string {
        throw new Error("Method not implemented.");
    }
    payload(): any[] {
        throw new Error("Method not implemented.");
    }
    get EVENT(): string {
        return EVENT.TYPE_EVENT;
    }
    get NOTIFICATION(): string {
        return EVENT.TYPE_NOTIFICATION;
    }
    get COMMAND(): string {
        return EVENT.TYPE_COMMAND;
    }

}