import { IMessage } from "../Contracts/Message";
import { StreamMessage } from "./StreamMessage";

/**
* Class ReceivedMessage.
*/
export class ReceivedMessage extends StreamMessage {
    /**
     * ReceivedMessage constructor.
     * @param  id
     * @param  content
     * @throws JsonException
     */
    constructor(id: string, payload: any) {
        super();
        let content: IMessage = {
            _id: id,
            name: payload['name'] || '',
            data: JSON.parse(payload['data'])
        };
        content = Object.assign({}, payload, content);
        this.content = content;
    }
}