import { IMessage } from "../Contracts/Message";
import { StreamableMessage } from "../Contracts/StreamableMessage";

export abstract class StreamMessage implements StreamableMessage {
    /**
     * @var Message
     */
    protected content: IMessage;

    getContent(): IMessage {
        return this.content;
    }
    /**
     * @return string
     */
    public getId(): string {
        return this.content._id || '';
    }
    /**
    * @return string
    */
    public getEventName(): string {
        return this.content.name || '';
    }

    /**
     * @return array
     */
    public getData(): any {
        return this.content.data ?? [];
    }
    /**
     * Retrieves values directly from the content data.
     *
     * @param  key  dot.notation string
     * @param $default
     * @return any
     */
    public get(key: string, $default: any = null) {
        const data: any = this.content;
        return data[key] || $default;
    }

}