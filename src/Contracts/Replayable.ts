/**
 * Interface Replayable
 */
export interface Replayable {
    /**
     * Event name. Can be any string.
     * Used to group replayable events together.
     *
     * @return string
     */
    name(): string;

    /**
     * Returns unique identifier for the event, that makes it possible to replay it from stream.
     * 
     * @return string
     */
    getIdentifier(): string;
}

// The function event is a user defined type guard
// the return type: 'event is Replayable' is a type predicate, 
// it determines whether the object is a Replayable
export function isReplayable(event: object): event is Replayable {
    return (event as Replayable).name !== undefined && (event as Replayable).getIdentifier !== undefined;
}