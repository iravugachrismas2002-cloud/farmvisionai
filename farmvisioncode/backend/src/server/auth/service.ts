import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { createTransport, type SendMailOptions } from "nodemailer";
import { getPrismaClient } from "../../server/db/prisma";
import { ApprovalStatus, FarmVisionRole } from "../../generated/prisma/enums";

const scryptAsync = promisify(scrypt);
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

type MailTransport = {
  sendMail(options: SendMailOptions): Promise<unknown>;
};

let transport: MailTransport | undefined;

export function getMailTransport(): MailTransport {

  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  const secureSetting = process.env.SMTP_SECURE?.trim().toLowerCase();
  const from = process.env.SMTP_FROM?.trim();

  if (
    !host ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535 ||
    !user ||
    !password ||
    !from
  ) {
    throw new Error(
      "Email delivery is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM.",
    );
  }

  if (secureSetting && secureSetting !== "true" && secureSetting !== "false") {
    throw new Error("SMTP_SECURE must be either true or false.");
  }

  transport = createTransport({
    host,
    port,
    secure: secureSetting === "true",
    auth: { user, pass: password },
  });

  return transport;
}

function getApplicationBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (!value && process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }
  if (!value) {
    throw new Error("NEXT_PUBLIC_BASE_URL is required for production email links.");
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_BASE_URL must be a valid absolute URL.");
  }

  if (
    (url.protocol !== "https:" &&
      !(url.protocol === "http:" && url.hostname === "localhost")) ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error("NEXT_PUBLIC_BASE_URL must use HTTPS, except for local development.");
  }

  return url.origin;
}

export const generateVerificationToken = (): string => randomBytes(32).toString("hex");

export const generateResetToken = (): string => randomBytes(32).toString("hex");

export async function findUserByEmail(email: string) {
  return getPrismaClient().user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const separator = stored.indexOf(":");
    if (separator <= 0) return false;

    const salt = stored.slice(0, separator);
    const encodedKey = stored.slice(separator + 1);
    const expectedKey = Buffer.from(encodedKey, "hex");
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

    return expectedKey.length === derivedKey.length && timingSafeEqual(derivedKey, expectedKey);
  } catch {
    return false;
  }
}

export async function createUser({
  email,
  password,
  firstName,
  lastName,
  role,
}: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: FarmVisionRole;
}) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const passwordHash = `${salt}:${derivedKey.toString("hex")}`;
  const verificationToken = generateVerificationToken();
  const openId = randomBytes(16).toString("hex");

  const user = await getPrismaClient().user.create({
    data: {
      email: email.trim().toLowerCase(),
      openId,
      passwordHash,
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      approvalStatus: ApprovalStatus.PENDING,
      verificationToken,
      verificationExpiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
      roles: {
        create: { role },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      approvalStatus: true,
      createdAt: true,
      roles: {
        select: { role: true },
      },
      verificationToken: true,
    },
  });

  return { user, verificationToken };
}

export async function verifyEmail(token: string) {
  const user = await getPrismaClient().user.findUnique({
    where: { verificationToken: token },
  });

  if (!user || !user.verificationExpiresAt || user.verificationExpiresAt < new Date()) {
    return { success: false, error: "Invalid or expired verification token." } as const;
  }

  const verifiedUser = await getPrismaClient().user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null,
      verificationExpiresAt: null,
    },
    select: {
      id: true,
      email: true,
      approvalStatus: true,
      emailVerified: true,
    },
  });

  return { success: true, user: verifiedUser } as const;
}

export async function approveUser(userId: string) {
  return getPrismaClient().user.update({
    where: { id: userId },
    data: { approvalStatus: ApprovalStatus.APPROVED },
    select: {
      id: true,
      email: true,
      approvalStatus: true,
      name: true,
    },
  });
}

export async function rejectUser(userId: string) {
  return getPrismaClient().user.update({
    where: { id: userId },
    data: { approvalStatus: ApprovalStatus.REJECTED },
    select: {
      id: true,
      email: true,
      approvalStatus: true,
    },
  });
}

export async function initiatePasswordReset(email: string) {
  const user = await getPrismaClient().user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  // Return the same shape for unknown addresses so callers do not disclose account existence.
  if (!user) return { success: true, resetToken: null, resetExpiresAt: null } as const;

  const resetToken = generateResetToken();
  const resetExpiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  await getPrismaClient().user.update({
    where: { id: user.id },
    data: { passwordResetToken: resetToken, passwordResetExpiresAt: resetExpiresAt },
  });

  return { success: true, resetToken, resetExpiresAt } as const;
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const user = await getPrismaClient().user.findUnique({
    where: { passwordResetToken: token },
  });

  if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
    return false;
  }

  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(newPassword, salt, 64)) as Buffer;

  await getPrismaClient().user.update({
    where: { id: user.id },
    data: {
      passwordHash: `${salt}:${derivedKey.toString("hex")}`,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    },
  });

  return true;
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = new URL(
    `/auth/verify-email?token=${encodeURIComponent(token)}`,
    getApplicationBaseUrl(),
  ).toString();

  await getMailTransport().sendMail({
    from: process.env.SMTP_FROM?.trim(),
    to: email,
    subject: "Verify your FarmVision account",
    text: `Please verify your FarmVision account:\n\n${verificationLink}\n\nThis link expires in 24 hours.`,
    html: `<p>Please verify your FarmVision account:</p><p><a href="${verificationLink}">Verify email</a></p><p>This link expires in 24 hours.</p>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = new URL(
    `/auth/reset-password?token=${encodeURIComponent(token)}`,
    getApplicationBaseUrl(),
  ).toString();

  await getMailTransport().sendMail({
    from: process.env.SMTP_FROM?.trim(),
    to: email,
    subject: "Reset your FarmVision password",
    text: `Reset your FarmVision password:\n\n${resetLink}\n\nThis link expires in one hour.`,
    html: `<p>Reset your FarmVision password:</p><p><a href="${resetLink}">Reset password</a></p><p>This link expires in one hour.</p>`,
  });
}

export async function sendApprovalEmail(email: string, approved: boolean, name: string) {
  const status = approved ? "approved" : "rejected";
  const baseUrl = getApplicationBaseUrl();
  const loginLink = new URL("/login", baseUrl).toString();
  const contactLink = new URL("/contact", baseUrl).toString();

  await getMailTransport().sendMail({
    from: process.env.SMTP_FROM?.trim(),
    to: email,
    subject: `Your FarmVision account has been ${status}`,
    text: approved
      ? `Hello ${name},\n\nYour FarmVision account has been approved. Log in at ${loginLink}.`
      : `Hello ${name},\n\nYour FarmVision account application has been rejected. Contact support at ${contactLink}.`,
  });
}
