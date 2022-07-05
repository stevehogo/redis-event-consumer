import { Streamer } from "../EventDispatcher/Streamer";
import { ReceivedMessage } from "../EventDispatcher/ReceivedMessage";

export interface ListenerHandler {

    handle(message: ReceivedMessage, streamer?: Streamer): void;
}
// The function isHandler is a user defined type guard
// the return type: 'handler is ListenerHandler' is a type predicate, 
// it determines whether the object is a ListenerHandler
export function isHandler(handler: object): handler is ListenerHandler {
    return (handler as ListenerHandler).handle !== undefined;
}