import yargs, { boolean, number } from 'yargs';
import { hideBin } from 'yargs/helpers';
import ListenersStack from "../ListenersStack";
import { Streamer } from "./Streamer";
import Stream from "../Stream";
import { time } from '../lib/date-utils';
import { Consumer } from '../Stream/Consumer';
import { ReceivedMessage } from './ReceivedMessage';
import { isMessageReceiver } from '../Contracts/MessageReceiver';
import { EventEmitter } from 'events';
export class ListenCommand extends EventEmitter {

    private streamer: Streamer;

    private event: string;
    private group: string;
    private consumer: string;
    private reclaim: number;
    private last_id: string;
    private keepAlive: string;
    private maxAttempts: number;
    private purge: boolean;
    private archive: boolean;
    /**
     * ListenCommand constructor.
     */
    constructor(listen_and_fire: any = []) {
        super();
        this.streamer = new Streamer();
        ListenersStack.boot(listen_and_fire);
        this.streamer.on('stop', () => this.emit('stop'))
        this.streamer.on('error', (err) => this.emit('error', err))
    }
    run() {
        yargs(hideBin(process.argv))
            .usage('Usage: $0 <command> [options]')
            .command('streamer:listen <event_name>',
                'RedisStream listen command that awaits for new messages on given Stream ' +
                'and fires local events based on streamer configuration', (yargs) => {
                    yargs.positional('event_name', {
                        describe: 'Name of an event that should be listened to',
                        type: 'string'
                    })
                }, (argv: any) => {
                    this.event = argv['event_name'];
                    this.group = argv['group'];
                    this.consumer = argv['consumer'];
                    this.reclaim = argv['reclaim'] || 0;
                    this.last_id = argv['last-id'] || '0-0';
                    this.keepAlive = argv['keep-alive'] || '';
                    this.maxAttempts = argv['max-attempts'] || 0;
                    this.purge = !!argv['purge'];
                    this.archive = !!argv['archive'];
                    this.handle();
                })
            .demandCommand(1)
            .option('group', {
                description: 'Name of your streaming group. Only when group is provided listener will listen on group as consumer',
                type: 'string'
            })
            .option('consumer', {
                description: 'Name of your group consumer. If not provided a name will be created as groupname-timestamp',
                type: 'string'
            })
            .option('reclaim', {
                description: 'Milliseconds of pending messages idle time, that should be reclaimed for current consumer in this group. Can be only used with group listening',
                type: 'number'
            })
            .option('last-id', {
                description: 'ID from which listener should start reading messages',
                type: 'string'
            })
            .option('keep-alive', {
                description: 'Will keep listener alive when any unexpected non-listener related error will occur by simply restarting listening.',
                type: 'string'
            })
            .option('max-attempts', {
                description: 'Number of maximum attempts to restart a listener on an unexpected non-listener related error',
                type: 'number'
            })
            .option('purge', {
                description: 'Will remove message from the stream if it will be processed successfully by all listeners in the current stack.',
                type: 'boolean'
            })
            .option('archive', {
                description: 'Will remove message from the stream and store it in database if it will be processed successfully by all listeners in the current stack.',
                type: 'boolean'
            })
            .demandOption(['group', 'consumer'])
            .parse()
    }
    async handle() {
        const listeners: any = ListenersStack.all();
        const localListeners: any = listeners[this.event] || null;
        if (localListeners == null) {
            console.error(`There are no local listeners associated with '${this.event}' event in configuration.`);
            return;
        }
        if (this.last_id !== '') {
            this.streamer.startFrom(this.last_id);
        }
        if (this.group != '') {
            const stream = new Stream(this.event);
            await this.setupGroupListening(stream);
        }

        this.listen(this.event, function (message: ReceivedMessage, streamer?: Streamer) {
            let failed: boolean = false;
            for (const as in localListeners) {
                const receiver: any = localListeners[as];
                if (!isMessageReceiver(receiver)) {
                    // console.error(`Listener class [${receiver}] needs to implement MessageReceiver`)
                    continue;
                }
                try {
                    receiver.handle(message);
                } catch (e) {
                    failed = true;
                    // report($e);

                    // $this->printError($message, $listener, $e);
                    // $this->failer->store($message, $receiver, $e);
                    continue;
                }
            }

            if (failed) {
                return;
            }

            // if ($this->option('archive')) {
            //     $this->archive($message);
            // }

            // if (!$this->option('archive') && $this->option('purge')) {
            //     $this->purge($message);
            // }
        });


    }

    /**
     * @param  event
     * @param  handler
     * @throws Error
     */
    private listen(event: string, handler: any): void {
        try {
            this.streamer.listen(event, handler);
        } catch (e) {
            if (!this.keepAlive) {
                this.emit('stop');
                return;
            }

            //  $this->error($e->getMessage());

            if (this.maxAttempts === 0) {
                this.emit('stop');
                return;
            }

            // $this -> warn('Starting listener again due to unexpected error.');
            if (this.maxAttempts > 0) {
                // $this -> warn("Attempts left: $this->maxAttempts");
                this.maxAttempts--;
            }

            this.listen(event, handler);
        }
    }

    /**
     * @param  stream
     */
    private async setupGroupListening(stream: Stream): Promise<void> {
        const hasGroup = await stream.groupExists(this.group);
        if (!hasGroup) {
            await stream.createGroup(this.group);
            //$this->info("Created new group: {$this->option('group')} on a stream: {$this->argument('event')}");
        }
        if (this.consumer == '') {
            this.consumer = this.group + '-' + time();
        }
        if (this.reclaim > 0) {
            await this.reclaimMessages(stream, this.consumer);
        }
        this.streamer.asConsumer(this.consumer, this.group);
    }

    /**
    * @param  stream
    * @param  consumerName
    */
    private async reclaimMessages(stream: Stream, consumerName: string): Promise<void> {
        const pendingMessages: any = await stream.pending(this.group);

        const ids: any = [];
        for (const i in pendingMessages) {
            ids.push(pendingMessages[i]['id']);
        }
        if (ids.length <= 0) {
            return;
        }
        const consumer = new Consumer(consumerName, stream, this.group);
        await consumer.claim(ids, this.reclaim);
    }
}