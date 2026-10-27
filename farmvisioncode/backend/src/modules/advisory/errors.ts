export class AdvisoryAccessError extends Error {
  constructor(message = "Advisory access denied.") {
    super(message);
    this.name = "AdvisoryAccessError";
  }
}

export type AdvisoryServiceErrorCode =
  | "ROLE_REQUIRED"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "CONFLICT"
  | "EVIDENCE_INVALID";

export class AdvisoryServiceError extends Error {
  constructor(
    readonly code: AdvisoryServiceErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AdvisoryServiceError";
  }
}

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}