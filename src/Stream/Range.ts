/**
* Class Range.
*/
export enum RANGE {
    FIRST = '-',
    LAST = '+',
    FORWARD = 1,
    BACKWARD = 2
}
export class Range {
    private start: string;
    private stop: string;
    private direction: number;

    /**
     * @return string
     */
    public getStart(): string {
        return this.start;
    }
    /**
     * @return string
     */
    public getStop(): string {
        return this.stop;
    }

    /**
     * @return number
     */
    public getDirection(): number {
        return this.direction;
    }

    /**
     * Range constructor.
     *
     * @param start
     * @param stop
     * @param direction
     */
    constructor(start: string = RANGE.FIRST, stop: string = RANGE.LAST, direction: number = RANGE.FORWARD) {
        this.start = start;
        this.stop = stop;
        this.direction = direction;
    }
}