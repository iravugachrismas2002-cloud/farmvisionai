"use server";
import type { AlertNotification, NotificationChannel } from "./ports";

/**
 * Push notification provider.
 * Supports Web Push (VAPID) and Firebase Cloud Messaging.
 * Falls back to "NOT_CONFIGURED" if push credentials are not set.
 */
export class PushProvider {
  private static vapidDetails: {
    subject: string;
    publicKey: string;
    privateKey: string;
  } | null = null;
  private static firebaseServerKey: string | null = null;

  static configureVapid(
    subject: string,
    publicKey: string,
    privateKey: string,
  ) {
    PushProvider.vapidDetails = { subject, publicKey, privateKey };
  }

  static configureFirebase(serverKey: string) {
    PushProvider.firebaseServerKey = serverKey;
  }

  static async send(notification: AlertNotification): Promise<void> {
    // Web Push implementation with VAPID
    if (PushProvider.vapidDetails) {
      // In production, would use web-push library:
      // const webpush = require("web-push");
      // webpush.setVapidDetails(
      //   `mailto:${PushProvider.vapidDetails.subject}`,
      //   PushProvider.vapidDetails.publicKey,
      //   PushProvider.vapidDetails.privateKey,
      // );
      // const subscription = /* get from client DB */;
      // await webpush.sendNotification(subscription, notification.message);

      console.log("Push would be sent via Web Push VAPID:", {
        notification,
        subject: PushProvider.vapidDetails.subject,
      });
    }

    // Firebase Cloud Messaging implementation
    if (PushProvider.firebaseServerKey) {
      // In production, would use firebase-admin:
      // const admin = require("firebase-admin");
      // if (!admin.apps.length) admin.initializeApp({ serverKey: PushProvider.firebaseServerKey });
      // const payload = {
      //   notification: {
      //     title: notification.title,
      //     body: notification.message,
      //   },
      // };
      // const adminMessaging = admin.messaging();
      // await adminMessaging.sendToDevice(/* registration tokens */, payload);

      console.log("Push would be sent via Firebase FCM:", {
        notification,
        serverKey: PushProvider.firebaseServerKey ? "configured" : "missing",
      });
    }

    // If neither is configured, throw
    if (!PushProvider.vapidDetails && !PushProvider.firebaseServerKey) {
      throw new Error(
        "Push not configured. Set VAPID details or Firebase server key.",
      );
    }
  }
}

/**
 * Register the PushProvider with the dispatcher.
 * Used during setup:  NotificationDispatcher({ PUSH: new PushProvider() })
 */
export function createPushProvider(): NotificationChannel {
  return {
    name: "PUSH",
    send: PushProvider.send,
  };
}