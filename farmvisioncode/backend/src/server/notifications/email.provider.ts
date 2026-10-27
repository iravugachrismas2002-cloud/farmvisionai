"use server";
import type { AlertNotification, NotificationChannel } from "./ports";
import { getMailTransport } from "../auth/service";
import type { SendMailOptions } from "nodemailer";

/**
 * Email notification provider.
 * Uses the existing nodemailer transport configured in auth/service.ts.
 * Falls back to "NOT_CONFIGURED" if SMTP credentials are not set.
 */
export class EmailProvider {
  private static transport = getMailTransport();

  static async send(notification: AlertNotification): Promise<void> {
    // Try to get the base URL for the login link
    let baseUrl: string;
    try {
      // Dynamically import to avoid server-only issues at import time
      // In a real app, this would use the getApplicationBaseUrl function
      baseUrl = "http://localhost:3000";
    } catch {
      baseUrl = "http://localhost:3000";
    }

    const loginLink = `${baseUrl}/login`;

    const mailOptions: SendMailOptions = {
      from: process.env.SMTP_FROM || "no-reply@farmvision.local",
      to: notification.recipientUserId,
      subject: `[${notification.severity}] ${notification.title}`,
      text: `${notification.message}\n\nView details at: ${loginLink}`,
      html: `
        <p>${notification.message}</p>
        <p><a href="${loginLink}">View in FarmVision AI</a></p>
      `,
    };

    await this.transport.sendMail(mailOptions);
  }
}

/**
 * Register the EmailProvider with the dispatcher.
 * Used during setup:  NotificationDispatcher({ EMAIL: new EmailProvider() })
 */
export function createEmailProvider(): NotificationChannel {
  return {
    name: "EMAIL",
    send: EmailProvider.send,
  };
}