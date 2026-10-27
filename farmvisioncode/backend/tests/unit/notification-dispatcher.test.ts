import { describe, expect, it, vi } from "vitest";
import { NotificationDispatcher, type NotificationChannel } from "@/server/notifications/ports";

const notification = {
  recipientUserId: "user-1",
  alertId: "alert-1",
  severity: "WARNING" as const,
  title: "Feed level",
  message: "Check feed level.",
};

describe("notification abstraction", () => {
  it("does not deliver when no provider is configured", async () => {
    const dispatcher = new NotificationDispatcher();
    await expect(dispatcher.dispatch("EMAIL", notification)).resolves.toBe("NOT_CONFIGURED");
  });

  it("delegates only to an explicitly injected provider", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const provider: NotificationChannel = { name: "PUSH", send };
    const dispatcher = new NotificationDispatcher({ PUSH: provider });
    await expect(dispatcher.dispatch("PUSH", notification)).resolves.toBe("SENT");
    expect(send).toHaveBeenCalledWith(notification);
  });
});
