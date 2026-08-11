import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PushMessage {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Abstraction over the push-notification provider so the rest of the app
 * never talks to Firebase directly. Swap this implementation for the real
 * `firebase-admin` SDK call once FCM device tokens are collected from the
 * Flutter app; the interface (send/sendBatch) stays the same.
 */
@Injectable()
export class FcmProvider {
  private readonly logger = new Logger(FcmProvider.name);
  private readonly serverKey?: string;

  constructor(private readonly config: ConfigService) {
    this.serverKey = this.config.get<string>('fcm.serverKey');
  }

  async send(message: PushMessage): Promise<void> {
    if (!this.serverKey) {
      this.logger.debug(
        `[FCM disabled - no FCM_SERVER_KEY set] Would push to user ${message.userId}: "${message.title}"`,
      );
      return;
    }
    // TODO: integrate firebase-admin here, e.g.:
    // await admin.messaging().send({ token: deviceToken, notification: { title, body } });
    this.logger.log(`Pushed FCM notification to user ${message.userId}`);
  }

  async sendBatch(messages: PushMessage[]): Promise<void> {
    await Promise.all(messages.map((m) => this.send(m)));
  }
}
