import { ConfigService } from '@nestjs/config';
export interface PushMessage {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, string>;
}
export declare class FcmProvider {
    private readonly config;
    private readonly logger;
    private readonly serverKey?;
    constructor(config: ConfigService);
    send(message: PushMessage): Promise<void>;
    sendBatch(messages: PushMessage[]): Promise<void>;
}
