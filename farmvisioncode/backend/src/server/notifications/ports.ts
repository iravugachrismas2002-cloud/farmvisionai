import type { AlertSeverity } from "../../generated/prisma/enums";

export type NotificationChannelName = "SMS" | "EMAIL" | "PUSH";
export type NotificationDeliveryStatus = "SENT" | "NOT_CONFIGURED";

export type AlertNotification = {
  recipientUserId: string;
  alertId: string;
  severity: AlertSeverity;
  title: string;
  message: string;
};

export interface NotificationChannel {
  readonly name: NotificationChannelName;
  send(notification: AlertNotification): Promise<void>;
}

/**
 * Inject real providers only after user consent, secrets, delivery policy,
 * retries, and data-retention controls have been reviewed. No provider is
 * registered in the current prototype, so calls are non-delivering by default.
 */
export class NotificationDispatcher {
  constructor(
    private readonly channels: Partial<Record<NotificationChannelName, NotificationChannel>> = {},
  ) {}

  async dispatch(
    channelName: NotificationChannelName,
    notification: AlertNotification,
  ): Promise<NotificationDeliveryStatus> {
    const channel = this.channels[channelName];
    if (!channel) return "NOT_CONFIGURED";
    await channel.send(notification);
    return "SENT";
  }
}
