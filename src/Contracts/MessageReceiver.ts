import { ReceivedMessage } from "../EventDispatcher/ReceivedMessage";

/**
 * Interface MessageReceiver
 */
export interface MessageReceiver {

    /**
     * @param  message
     */
    handle(message: ReceivedMessage): void;
}

export function isMessageReceiver(handler: object): handler is MessageReceiver {
    return (handler as MessageReceiver).handle !== undefined;
}