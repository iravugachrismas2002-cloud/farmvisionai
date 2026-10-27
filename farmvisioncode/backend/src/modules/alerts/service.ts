import "server-only";
import { AlertEventType, AlertSeverity, AlertStatus, FarmVisionRole, Prisma } from "../../generated/prisma/client";
import { getPrismaClient } from "../../server/db/prisma";
import {
  acknowledgeRecommendationForAlert,
  resolveRecommendationForAlert,
  synchronizeRecommendationForAlert,
} from "../recommendations/service";
import { planAlertTransition } from "./lifecycle";
import { evaluateSensorAlerts, type SensorSnapshot } from "./rules";

export class AlertAccessError extends Error {
  constructor(message = "The requested alert is not available to this account.") {
    super(message);
    this.name = "AlertAccessError";
  }
}

export class AlertStateConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AlertStateConflictError";
  }
}

async function addEvent(
  tx: Prisma.TransactionClient,
  alertId: string,
  eventType: AlertEventType,
  severity: AlertSeverity,
  message: string,
  observedValue?: number,
  thresholdValue?: number,
  unit?: string,
  actorId?: string,
) {
  return tx.alertEvent.create({
    data: {
      alertId,
      eventType,
      severity,
      message,
      observedValue,
      thresholdValue,
      unit,
      actorId,
    },
  });
}

export async function synchronizeAlertsForTelemetry(
  tx: Prisma.TransactionClient,
  deviceId: string,
  observedAt: Date,
  receivedAt: Date,
  deviceSource: "HARDWARE" | "SIMULATOR",
  snapshot: SensorSnapshot,
) {
  const evaluations = evaluateSensorAlerts(snapshot);
  for (const evaluation of evaluations) {
    const current = await tx.alert.findUnique({
      where: { deviceId_type: { deviceId, type: evaluation.type } },
      select: {
        id: true,
        severity: true,
        status: true,
      },
    });
    const transition = planAlertTransition(current, evaluation);

    if (transition === "NOOP") continue;

    if (transition === "RESOLVE" && current) {
      await tx.alert.update({
        where: { id: current.id },
        data: {
          status: AlertStatus.RESOLVED,
          resolvedAt: receivedAt,
          acknowledgedAt: null,
          acknowledgedById: null,
          observedValue: evaluation.observedValue,
          reason: evaluation.reason,
        },
      });
      await addEvent(
        tx,
        current.id,
        AlertEventType.RESOLVED,
        AlertSeverity.INFO,
        `${evaluation.title} returned within the configured prototype range.`,
        evaluation.observedValue,
        evaluation.thresholdValue,
        evaluation.unit,
      );
      await resolveRecommendationForAlert(tx, current.id, receivedAt);
      continue;
    }

    if (transition === "CREATE" || !current) {
      const created = await tx.alert.create({
        data: {
          deviceId,
          type: evaluation.type,
          severity: evaluation.severity,
          status: AlertStatus.OPEN,
          title: evaluation.title,
          reason: evaluation.reason,
          suggestedAction: evaluation.suggestedAction,
          observedValue: evaluation.observedValue,
          thresholdValue: evaluation.thresholdValue,
          unit: evaluation.unit,
          firstTriggeredAt: observedAt,
          lastTriggeredAt: observedAt,
        },
        select: { id: true },
      });
      await addEvent(
        tx,
        created.id,
        AlertEventType.TRIGGERED,
        evaluation.severity,
        evaluation.reason,
        evaluation.observedValue,
        evaluation.thresholdValue,
        evaluation.unit,
      );
      await synchronizeRecommendationForAlert(tx, created.id, {
        alertType: evaluation.type,
        severity: evaluation.severity,
        status: AlertStatus.OPEN,
        reason: evaluation.reason,
        observedValue: evaluation.observedValue,
        thresholdValue: evaluation.thresholdValue,
        unit: evaluation.unit,
        observedAt,
        generatedAt: receivedAt,
        deviceSource,
      }, {
        status: "OPEN",
        acknowledgedAt: null,
        acknowledgedById: null,
      });
      continue;
    }

    const reopening = transition === "REOPEN";
    const severityChanged = transition === "ESCALATE" || transition === "SEVERITY_CHANGED";
    const escalated = transition === "ESCALATE";
    const nextStatus = reopening || escalated
      ? AlertStatus.OPEN
      : current.status;

    const updatedAlert = await tx.alert.update({
      where: { id: current.id },
      data: {
        severity: evaluation.severity,
        status: nextStatus,
        title: evaluation.title,
        reason: evaluation.reason,
        suggestedAction: evaluation.suggestedAction,
        observedValue: evaluation.observedValue,
        thresholdValue: evaluation.thresholdValue,
        unit: evaluation.unit,
        lastTriggeredAt: observedAt,
        resolvedAt: reopening ? null : undefined,
        acknowledgedAt: reopening || escalated ? null : undefined,
        acknowledgedById: reopening || escalated ? null : undefined,
      },
      select: { status: true, acknowledgedAt: true, acknowledgedById: true },
    });

    if (reopening || severityChanged) {
      const eventType = reopening
        ? AlertEventType.TRIGGERED
        : escalated
          ? AlertEventType.ESCALATED
          : AlertEventType.SEVERITY_CHANGED;
      const message = reopening
        ? `Condition returned: ${evaluation.reason}`
        : severityChanged
          ? `Severity changed to ${evaluation.severity.toLowerCase()}: ${evaluation.reason}`
          : evaluation.reason;
      await addEvent(
        tx,
        current.id,
        eventType,
        evaluation.severity,
        message,
        evaluation.observedValue,
        evaluation.thresholdValue,
        evaluation.unit,
      );
    }
    const recommendationStatus = updatedAlert.status === AlertStatus.ACKNOWLEDGED
      ? AlertStatus.ACKNOWLEDGED
      : AlertStatus.OPEN;
    await synchronizeRecommendationForAlert(tx, current.id, {
      alertType: evaluation.type,
      severity: evaluation.severity,
      status: updatedAlert.status,
      reason: evaluation.reason,
      observedValue: evaluation.observedValue,
      thresholdValue: evaluation.thresholdValue,
      unit: evaluation.unit,
      observedAt,
      generatedAt: receivedAt,
      deviceSource,
    }, {
      status: recommendationStatus,
      acknowledgedAt: updatedAlert.acknowledgedAt,
      acknowledgedById: updatedAlert.acknowledgedById,
    });
  }
}

export async function listAlertsForOwner(ownerId: string, status?: AlertStatus, limit = 100) {
  const db = getPrismaClient();
  const farmer = await db.userRole.findUnique({
    where: { userId_role: { userId: ownerId, role: FarmVisionRole.FARMER } },
    select: { userId: true },
  });
  if (!farmer) throw new AlertAccessError("A Farmer role is required to view alerts.");

  return db.alert.findMany({
    where: {
      ...(status ? { status } : {}),
      device: { farm: { ownerId } },
    },
    orderBy: [{ lastTriggeredAt: "desc" }, { id: "desc" }],
    take: limit,
    select: {
      id: true,
      type: true,
      severity: true,
      status: true,
      title: true,
      reason: true,
      suggestedAction: true,
      observedValue: true,
      thresholdValue: true,
      unit: true,
      firstTriggeredAt: true,
      lastTriggeredAt: true,
      acknowledgedAt: true,
      resolvedAt: true,
      device: {
        select: {
          id: true,
          publicId: true,
          name: true,
          source: true,
          farm: { select: { id: true, name: true } },
        },
      },
      events: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          eventType: true,
          severity: true,
          message: true,
          observedValue: true,
          thresholdValue: true,
          unit: true,
          createdAt: true,
          actor: { select: { name: true, email: true } },
        },
      },
    },
  });
}

export async function acknowledgeAlertForOwner(ownerId: string, alertId: string) {
  const db = getPrismaClient();
  return db.$transaction(async (tx) => {
    const farmer = await tx.userRole.findUnique({
      where: { userId_role: { userId: ownerId, role: FarmVisionRole.FARMER } },
      select: { userId: true },
    });
    if (!farmer) throw new AlertAccessError("A Farmer role is required to acknowledge alerts.");

    const alert = await tx.alert.findFirst({
      where: { id: alertId, device: { farm: { ownerId } } },
      select: { id: true, status: true, severity: true, title: true },
    });
    if (!alert) throw new AlertAccessError();
    if (alert.status === AlertStatus.ACKNOWLEDGED) {
      return { alreadyAcknowledged: true, alertId: alert.id };
    }
    if (alert.status === AlertStatus.RESOLVED) {
      throw new AlertStateConflictError("Resolved alerts cannot be acknowledged.");
    }

    const acknowledgedAt = new Date();
    const updated = await tx.alert.updateMany({
      where: {
        id: alert.id,
        status: AlertStatus.OPEN,
        device: { farm: { ownerId } },
      },
      data: {
        status: AlertStatus.ACKNOWLEDGED,
        acknowledgedAt,
        acknowledgedById: ownerId,
      },
    });
    if (updated.count !== 1) {
      throw new AlertStateConflictError("The alert changed before it could be acknowledged. Refresh and try again.");
    }

    const event = await addEvent(
      tx,
      alert.id,
      AlertEventType.ACKNOWLEDGED,
      alert.severity,
      `Acknowledged by farm owner for ${alert.title}.`,
      undefined,
      undefined,
      undefined,
      ownerId,
    );
    await acknowledgeRecommendationForAlert(tx, alert.id, ownerId, acknowledgedAt);
    return { alreadyAcknowledged: false, alertId: alert.id, acknowledgedAt, event };
  });
}
