export interface IMessage{
    _id: string,
    name: string,
    data: any,
    original_id?: string,
    type?: string,
    version?: string,
    domain?: string,
    hash?: string,
    created?: number
}