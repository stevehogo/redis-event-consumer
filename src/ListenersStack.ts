export default class ListenersStack {

    private static events: Map<string, Set<string>>;

    /**
     * @param events
     */
    public static boot(events: Map<string, Set<string>>): void {
        ListenersStack.events = events;
    }

    /**
    * @return array
    */
    public static all(): Map<string, Set<string>> {
        return ListenersStack.events;
    }

    /**
     * Add event listener to stack
     *
     * @param  event
     * @param  listener
     */
    public static add(event: string, listener: string): void {
        if (!ListenersStack.events.has(event)) {
            ListenersStack.events.set(event, new Set<string>());
        }
        if (!ListenersStack.events.get(event)?.has(listener)) {
            ListenersStack.events.get(event)?.add(listener);
        }
    }

    /**
     * Add many listeners to stack at once.
     * Uses ListenersStack::add underneath
     *
     * @param  stack [event => [listeners]]
     */
     public static addMany(stack: Map<string, Set<string>>): void
     {
        for (let event of stack.keys()) {
            let  listeners = stack.get(event);
            if(listeners){
                for (let listener of listeners) {
                    ListenersStack.add(event, listener);
                }
            }
        }
     }
}