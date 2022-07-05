export interface StreamableMessage{    
    /**
     * @return Object
     */

    getContent(): Object;
    setName(name: string): Object;
}