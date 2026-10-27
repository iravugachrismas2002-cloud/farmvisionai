"use service";
import type { AlertNotification, NotificationChannel } from "./ports";

/**
 * SMS notification provider using Twilio.
 * Falls back to "NOT_CONFIGURED" if Twilio credentials are not set.
 */
export class SmsProvider {
  private static accountSid: string;
  private static authToken: string;
  private static messagingServiceId: string | undefined;

  static configure(
    accountSid: string,
    authToken: string,
    messagingServiceId?: string,
  ) {
    SmsProvider.accountSid = accountSid;
    SmsProvider.authToken = authToken;
    SmsProvider.messagingServiceId = messagingServiceId;
  }

  static async send(notification: AlertNotification): Promise<void> {
    // Twilio SDK would be used here
    // For now, we'll log and raise NOT_CONFIGURED if not set up
    if (!SmsProvider.accountSid || !SmsProvider.authToken) {
      throw new Error("SMS not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.");
    }

    // In production, would use:
    // const client = require("twilio")(SmsProvider.accountSid, SmsProvider.authToken);
    // await client.messages.create({
    //   body: `${notification.title}: ${notification.message}`,
    //   messagingServiceSid: SmsProvider.messagingServiceId,
    //   to: notification.recipientUserId, // phone number
    // });

    // Placeholder - in real implementation, send via Twilio
    // For now, simulate the API call structure
    console.log("SMS would be sent via Twilio:", {
      to: notification.recipientUserId,
      body: `${notification.title}: ${notification.message}`,
    });
  }
}

/**
 * Register the SmsProvider with the dispatcher.
 * Used during setup:  NotificationDispatcher({ SMS: new SmsProvider() })
 */
export function createSmsProvider(): NotificationChannel {
  return {
    name: "SMS",
    send: SmsProvider.send,
  };
}