/**
 * Interface Waitable.
 */
export interface Waitable {
    /**
     * Get Waitable stream name.
     *
     * @return string
     */
    getName(): string;

    /**
     * Get key name for new entries, which is different depending on what is used.
     *
     * @return string
     */
    getNewEntriesKey(): string;

    /**
     * Awaits for a new message starting from last seen ID
     * ID can be a new entry key.
     *
     * @param lastSeenId
     * @param timeout
     *
     * @return array|null
     */
    await(lastSeenId: string, timeout: number, limit: number): any;

    /**
     * Acknowledge message on stream by ID.
     *
     * @param id
     */
    acknowledge(id: string): void;
}
