/**
 * Interface Listener.
 */
export interface Listener {
    /**
     * @param event   name
     * @param handler is fired when message is read from stream (old one or a new one)
     */
    listen(event: string, handler: any): void;
}
